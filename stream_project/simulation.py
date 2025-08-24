import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

from .logger import logger
from .config import ModelParameters
from .errors import NumericalError
from .rainfall import generate_physically_motivated_hyetograph
from .hydrology import scs_runoff_with_uncertainty, triangular_unit_hydrograph_enhanced
from .lorenz import integrate_coupled_system
from .operators import physical_observation_operator
from .filters import EnhancedParticleFilter
from .validation import ModelValidation
from .utils import headless_setup, save_figure, safe_json_dump

from typing import Optional, Dict, List, Tuple






def run_enhanced_simulation(config: Optional[ModelParameters] = None,
                          save_results: bool = True,
                          output_dir: str = "results") -> Dict:
    headless_setup()
    """
    Run enhanced hydrological simulation with comprehensive analysis.
   
    Args:
        config: Model configuration parameters
        save_results: Whether to save results to files
        output_dir: Output directory for results
       
    Returns:
        Dictionary containing simulation results and diagnostics
    """
    if config is None:
        config = ModelParameters()
   
    logger.info("=== Enhanced Hydrological Simulation with Chaos Theory ===")
    logger.info(f"Configuration: CN={config.CN}, Area={config.area_km2} km²")
   
    # Create output directory
    if save_results:
        Path(output_dir).mkdir(exist_ok=True)
   
    # Time setup
    dt = 1.0  # hours
    t_total_hours = 48
    t = np.arange(0, t_total_hours + dt, dt)
   
    # Generate synthetic hyetograph
    logger.info("Generating synthetic storm...")
    hyet = generate_physically_motivated_hyetograph(
        t,
        peak_mm_hr=config.peak_mm_hr,
        peak_time=config.peak_time,
        decay_rate=config.decay_rate,
        storm_type="exponential"
    )
   
    # Hydrological modeling
    logger.info("Running hydrological model...")
    area_m2 = config.area_km2 * 1e6
   
    # Enhanced SCS runoff calculation
    pe = scs_runoff_with_uncertainty(
        hyet,
        config.CN,
        lambda_ia=config.lambda_ia,
        antecedent_moisture="AMC_II"
    )
   
    # Unit hydrograph routing
    uh = triangular_unit_hydrograph_enhanced(
        t,
        t_peak=config.t_peak_hours,
        t_base=config.t_base_hours
    )
   
    # Route runoff
    conv = np.convolve(pe, uh)[:len(pe)]
    V_m3_per_dt = conv / 1000.0 * area_m2
    q_base = V_m3_per_dt / (dt * 3600.0)
   
    # Normalize for Lorenz forcing
    q_mean = np.mean(q_base)
    q_std = np.std(q_base)
    if q_std < 1e-9:
        q_std = 1.0
    r_normalized = np.tanh((q_base - q_mean) / q_std)
   
    # Generate true state evolution
    logger.info("Integrating coupled chaos-hydrology system...")
    initial_state = np.array([0.0, 1.0, 20.0, 0.0])
   
    try:
        states_true = integrate_coupled_system(
            t,
            initial_state,
            r_normalized,
            config.lorenz_params
        )
    except NumericalError as e:
        logger.error(f"Integration failed: {e}")
        return {"error": str(e)}
   
    # Generate synthetic observations
    logger.info("Generating synthetic observations...")
    Q_true = physical_observation_operator(states_true, q_base)
   
    # Add observation noise
    rng = np.random.default_rng(42)
    obs_noise_std = config.obs_error_base * np.maximum(np.abs(Q_true), config.obs_error_min)
    Q_obs = Q_true + rng.normal(0, obs_noise_std)
   
    # Sequential Monte Carlo Data Assimilation
    logger.info("Running Enhanced Sequential Monte Carlo...")
   
    # Parameter bounds for estimation
    param_bounds = {
        "rho": (24.0, 32.0),
        "gamma": (0.005, 0.025),
        "kappa": (0.08, 0.15),
        "mu": (0.005, 0.015),
        "y0_x": (-1.0, 1.0),
        "y0_y": (0.5, 1.5),
        "y0_z": (18.0, 22.0),
        "y0_w": (-0.5, 0.5),
        "Cn": (config.CN - 10, config.CN + 10)
    }
   
    # Initialize particle filter
    pf = EnhancedParticleFilter(
        n_particles=config.n_particles,
        param_bounds=param_bounds,
        resampling_threshold=config.resampling_threshold,
        adaptive_inflation=True,
        seed=123
    )
   
    # Storage for results
    ensemble_forecasts = np.full((config.n_particles, len(t)), np.nan)
    resampling_times = []
   
    # Assimilation loop
    logger.info("Performing data assimilation...")
    for i in range(1, len(t)):
        if i % 10 == 0:
            logger.info(f"Processing timestep {i}/{len(t)}")
       
        # Forecast step for each particle
        forecasts = []
        valid_particles = []
       
        for j, particle in enumerate(pf.particles):
            try:
                # Get particle-specific parameters
                lorenz_params_particle = config.lorenz_params.copy()
                lorenz_params_particle.update({
                    "rho": particle["parameters"]["rho"],
                    "gamma": particle["parameters"]["gamma"],
                    "kappa": particle["parameters"]["kappa"],
                    "mu": particle["parameters"]["mu"]
                })
               
                CN_particle = particle["parameters"]["Cn"]
               
                # Compute particle-specific runoff
                pe_particle = scs_runoff_with_uncertainty(
                    hyet[i-1:i+1],
                    CN_particle,
                    lambda_ia=config.lambda_ia
                )
               
                # Route through UH
                if len(pe_particle) > 1:
                    uh_window = uh[max(0, i-len(pe_particle)+1):i+1]
                    if len(uh_window) < len(pe_particle):
                        uh_window = np.pad(uh_window, (len(pe_particle) - len(uh_window), 0))
                    conv_particle = np.sum(pe_particle * uh_window[::-1])
                else:
                    conv_particle = pe_particle[0] * uh[i] if i < len(uh) else 0
               
                V_particle = conv_particle / 1000.0 * area_m2
                q_particle = V_particle / (dt * 3600.0)
               
                # Normalize forcing
                r_particle = np.tanh((q_particle - q_mean) / q_std)
               
                # Integrate one timestep
                y0_particle = particle["state"]
               
                states_particle = integrate_coupled_system(
                    t[i-1:i+1],
                    y0_particle,
                    np.array([r_normalized[i-1], r_particle]),
                    lorenz_params_particle
                )
               
                # Update particle state
                particle["state"] = states_particle[:, -1]
               
                # Generate observation
                q_base_current = np.interp(t[i], t, q_base)
                forecast = physical_observation_operator(
                    states_particle[:, -1:],
                    np.array([q_base_current])
                )[0]
               
                forecasts.append(forecast)
                ensemble_forecasts[j, i] = forecast
                valid_particles.append(j)
               
            except Exception as e:
                logger.warning(f"Particle {j} failed at timestep {i}: {str(e)}")
                forecasts.append(np.nan)
                ensemble_forecasts[j, i] = np.nan
       
        # Update weights if observations available
        if not np.isnan(Q_obs[i]) and len(forecasts) > 0:
            valid_forecasts = [f for f in forecasts if not np.isnan(f)]
            if len(valid_forecasts) > 0:
                obs_error = obs_noise_std[i]**2
                pf.update_weights(
                    np.array([Q_obs[i]]),
                    np.array(valid_forecasts),
                    obs_error
                )
               
                # Adaptive resampling
                if pf.resample():
                    resampling_times.append(i)
   
    logger.info("Data assimilation completed successfully")
   
    # Calculate ensemble statistics
    ensemble_median = np.nanmedian(ensemble_forecasts, axis=0)
    ensemble_mean = np.nanmean(ensemble_forecasts, axis=0)
    ensemble_std = np.nanstd(ensemble_forecasts, axis=0)
    ensemble_p05 = np.nanpercentile(ensemble_forecasts, 5, axis=0)
    ensemble_p95 = np.nanpercentile(ensemble_forecasts, 95, axis=0)
   
    # Comprehensive validation
    logger.info("Performing comprehensive validation...")
    validator = ModelValidation(Q_obs, ensemble_forecasts, t)
    validation_metrics = validator.calculate_all_metrics()
   
    # Parameter estimation results
    param_stats = pf.get_ensemble_statistics()
   
    # Print results
    logger.info("\n" + "="*50)
    logger.info("SIMULATION RESULTS")
    logger.info("="*50)
    logger.info(f"KGE: {validation_metrics['KGE']:.4f}")
    logger.info(f"NSE: {validation_metrics['NSE']:.4f}")
    logger.info(f"CRPS: {validation_metrics['CRPS']:.4f}")
    logger.info(f"Coverage (90%): {validation_metrics['Coverage_90']:.1%}")
    logger.info(f"Coverage (95%): {validation_metrics['Coverage_95']:.1%}")
    logger.info(f"Reliability: {validation_metrics['Reliability']:.4f}")
    logger.info(f"Resampling events: {len(resampling_times)}")
   
    # Create comprehensive plots
    logger.info("Generating plots...")
   
    # Main results plot
    fig, axes = plt.subplots(3, 2, figsize=(16, 12))
   
    # Hyetograph and base runoff
    axes[0,0].bar(t, hyet, width=0.8, color='skyblue', alpha=0.7, label='Rainfall (mm/hr)')
    axes[0,0].plot(t, q_base, 'g-', linewidth=2, label='Base Runoff (m³/s)')
    axes[0,0].set_ylabel('Rainfall (mm/hr) / Flow (m³/s)')
    axes[0,0].legend()
    axes[0,0].set_title('Hyetograph and Hydrological Response')
    axes[0,0].grid(True, alpha=0.3)
   
    # Ensemble forecast
    axes[0,1].fill_between(t, ensemble_p05, ensemble_p95,
                          color='lightblue', alpha=0.5, label='90% CI')
    axes[0,1].plot(t, ensemble_median, 'b-', linewidth=2, label='Ensemble Median')
    axes[0,1].plot(t, Q_obs, 'ro-', markersize=3, label='Observations')
    axes[0,1].plot(t, Q_true, 'k--', alpha=0.7, label='Truth')
    axes[0,1].set_ylabel('Discharge')
    axes[0,1].legend()
    axes[0,1].set_title('Ensemble Forecast vs Observations')
    axes[0,1].grid(True, alpha=0.3)
   
    # Lorenz attractor
    axes[1,0].plot(states_true[0,:], states_true[1,:], 'b-', alpha=0.7)
    axes[1,0].scatter(states_true[0,0], states_true[1,0], c='green', s=50, label='Start')
    axes[1,0].scatter(states_true[0,-1], states_true[1,-1], c='red', s=50, label='End')
    axes[1,0].set_xlabel('X (Discharge Anomaly)')
    axes[1,0].set_ylabel('Y (Energy Dissipation)')
    axes[1,0].set_title('Phase Space Trajectory (X-Y)')
    axes[1,0].legend()
    axes[1,0].grid(True, alpha=0.3)
   
    # Parameter evolution
    rho_values = [param_stats['rho']['mean']] * len(t)
    axes[1,1].plot(t, rho_values, 'r-', label=f"ρ = {param_stats['rho']['mean']:.2f}±{param_stats['rho']['std']:.2f}")
    gamma_values = [param_stats['gamma']['mean']] * len(t)
    axes[1,1].plot(t, gamma_values, 'b-', label=f"γ = {param_stats['gamma']['mean']:.3f}±{param_stats['gamma']['std']:.3f}")
    axes[1,1].set_ylabel('Parameter Values')
    axes[1,1].set_title('Estimated Parameters')
    axes[1,1].legend()
    axes[1,1].grid(True, alpha=0.3)
   
    # Residuals analysis
    residuals = Q_obs - ensemble_median
    axes[2,0].scatter(ensemble_median, residuals, alpha=0.6)
    axes[2,0].axhline(y=0, color='r', linestyle='--')
    axes[2,0].set_xlabel('Predicted')
    axes[2,0].set_ylabel('Residuals')
    axes[2,0].set_title('Residual Analysis')
    axes[2,0].grid(True, alpha=0.3)
   
    # Effective sample size
    axes[2,1].plot(pf.ess_history, 'g-', linewidth=2)
    axes[2,1].axhline(y=pf.resampling_threshold * config.n_particles,
                     color='r', linestyle='--', label='Resampling Threshold')
    for rt in resampling_times:
        axes[2,1].axvline(x=rt, color='orange', alpha=0.5)
    axes[2,1].set_ylabel('Effective Sample Size')
    axes[2,1].set_xlabel('Time Step')
    axes[2,1].set_title('Particle Filter Diagnostics')
    axes[2,1].legend()
    axes[2,1].grid(True, alpha=0.3)
   
    plt.tight_layout()
    if save_results:
        save_figure(fig, f"{output_dir}/enhanced_simulation_results.png")
   
    # 3D Lorenz plot
    fig_3d = plt.figure(figsize=(12, 8))
    ax_3d = fig_3d.add_subplot(111, projection='3d')
    ax_3d.plot(states_true[0,:], states_true[1,:], states_true[2,:], 'b-', alpha=0.7)
    ax_3d.scatter(states_true[0,0], states_true[1,0], states_true[2,0],
                 c='green', s=100, label='Start')
    ax_3d.scatter(states_true[0,-1], states_true[1,-1], states_true[2,-1],
                 c='red', s=100, label='End')
    ax_3d.set_xlabel('X (Discharge Anomaly)')
    ax_3d.set_ylabel('Y (Energy Dissipation)')
    ax_3d.set_zlabel('Z (Storage Index)')
    ax_3d.set_title('3D Lorenz Attractor - Hydrological Interpretation')
    ax_3d.legend()
    if save_results:
        save_figure(fig_3d, f"{output_dir}/lorenz_3d.png")
   
    # Compile results
    results = {
        "time": t,
        "observations": Q_obs,
        "truth": Q_true,
        "ensemble_forecasts": ensemble_forecasts,
        "ensemble_median": ensemble_median,
        "ensemble_statistics": {
            "mean": ensemble_mean,
            "std": ensemble_std,
            "p05": ensemble_p05,
            "p95": ensemble_p95
        },
        "validation_metrics": validation_metrics,
        "parameter_estimates": param_stats,
        "states_true": states_true,
        "hyetograph": hyet,
        "base_runoff": q_base,
        "resampling_times": resampling_times,
        "ess_history": pf.ess_history,
        "config": config
    }
   
    # Save arrays separately
    np.savez(f"{output_dir}/simulation_arrays.npz",
         time=t,
         observations=Q_obs,
         truth=Q_true,
         ensemble_forecasts=ensemble_forecasts,
         ensemble_median=ensemble_median,
         mean=ensemble_mean,
         std=ensemble_std,
         p05=ensemble_p05,
         p95=ensemble_p95,
         states_true=states_true,
         hyetograph=hyet,
         base_runoff=q_base,
         ess_history=np.array(pf.ess_history, dtype=float))

    # Save JSON summary + config safely
    summary = {
        "validation_metrics": validation_metrics,
        "parameter_estimates": param_stats,
        "resampling_times": resampling_times,
        "config": {
            "CN": config.CN,
            "area_km2": config.area_km2,
            "lorenz_params": config.lorenz_params,
            "n_particles": config.n_particles,
            "lambda_ia": config.lambda_ia,
            "t_peak_hours": config.t_peak_hours,
            "t_base_hours": config.t_base_hours,
            "peak_mm_hr": config.peak_mm_hr,
            "peak_time": config.peak_time,
            "decay_rate": config.decay_rate,
            "resampling_threshold": config.resampling_threshold,
            "obs_error_base": config.obs_error_base,
            "obs_error_min": config.obs_error_min,
        },
    }
    safe_json_dump(summary, f"{output_dir}/summary.json")
    
    return results