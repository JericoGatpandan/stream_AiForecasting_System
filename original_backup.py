# """
# Enhanced Hydrological Modeling with Chaos Theory and SMC Data Assimilation

# This module implements a physically-motivated coupling between hydrological processes
# and chaotic dynamics, with rigorous mathematical foundations and comprehensive
# validation framework.

# Mathematical Framework:
# - Hydrological state space: H = {discharge, soil moisture, channel storage, groundwater}
# - Chaos coupling via energy dissipation and nonlinear storage dynamics
# - Bayesian inference through Sequential Monte Carlo with adaptive resampling

# Author: Enhanced Implementation
# Date: 2025
# """

# import numpy as np
# import logging
# from typing import Dict, List, Tuple, Optional, Union, Callable
# from dataclasses import dataclass, field
# from scipy.integrate import solve_ivp
# from scipy.stats import qmc, multivariate_normal, chi2
# from scipy.optimize import minimize_scalar
# import matplotlib.pyplot as plt
# from mpl_toolkits.mplot3d import Axes3D
# import warnings
# import json
# from pathlib import Path

# # Configure logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # Suppress warnings for cleaner output
# warnings.filterwarnings('ignore', category=RuntimeWarning)

# @dataclass
# class ModelParameters:
#     """
#     Configuration class for model parameters with validation.
   
#     Physical Interpretation:
#     - CN: Soil Conservation Service Curve Number (dimensionless)
#     - area_km2: Catchment area in square kilometers
#     - lorenz_params: Physically motivated chaos parameters
#     """
#     # Hydrological parameters
#     CN: float = 78.0  # SCS Curve Number
#     lambda_ia: float = 0.2  # Initial abstraction coefficient
#     area_km2: float = 84.48  # Catchment area (Naga City watershed)
   
#     # Unit hydrograph parameters
#     t_peak_hours: float = 4.0  # Time to peak
#     t_base_hours: float = 18.0  # Base time
   
#     # Storm parameters
#     peak_mm_hr: float = 45.0  # Peak rainfall intensity
#     peak_time: float = 10.0   # Time of peak rainfall
#     decay_rate: float = 8.0   # Exponential decay parameter
   
#     # Physically-motivated Lorenz parameters
#     lorenz_params: Dict[str, float] = field(default_factory=lambda: {
#         "sigma": 10.0,      # Energy dissipation rate (1/time)
#         "rho": 28.0,        # Rayleigh number (dimensionless)
#         "beta": 8.0/3.0,    # Geometric factor (dimensionless)
#         "gamma": 0.015,     # Hydrological forcing strength
#         "kappa": 0.12,      # Storage decay rate (1/time)
#         "mu": 0.008,        # Channel-groundwater coupling
#         "alpha": 0.25,      # Energy transfer efficiency
#     })
   
#     # SMC parameters
#     n_particles: int = 1000
#     resampling_threshold: float = 0.5  # Effective sample size threshold
   
#     # Observation parameters
#     obs_error_base: float = 0.15  # Base observation error (fraction)
#     obs_error_min: float = 0.05   # Minimum observation error
   
#     def __post_init__(self):
#         """Validate parameters after initialization."""
#         self.validate()
   
#     def validate(self) -> None:
#         """Comprehensive parameter validation with physical constraints."""
#         if not (30 <= self.CN <= 100):
#             raise ValueError(f"CN must be between 30-100, got {self.CN}")
#         if self.area_km2 <= 0:
#             raise ValueError(f"Catchment area must be positive, got {self.area_km2}")
#         if self.peak_mm_hr <= 0:
#             raise ValueError(f"Peak rainfall must be positive, got {self.peak_mm_hr}")
#         if not (0 < self.lambda_ia < 1):
#             raise ValueError(f"Initial abstraction coefficient must be in (0,1), got {self.lambda_ia}")
       
#         # Validate Lorenz parameters for stability
#         lorenz = self.lorenz_params
#         if lorenz["sigma"] <= 0 or lorenz["beta"] <= 0:
#             raise ValueError("Lorenz stability parameters must be positive")
#         if not (0 < lorenz["gamma"] < 0.1):
#             raise ValueError(f"Hydrological forcing strength out of range: {lorenz['gamma']}")

# class ValidationError(Exception):
#     """Custom exception for validation errors."""
#     pass

# class NumericalError(Exception):
#     """Custom exception for numerical computation errors."""
#     pass

# def generate_physically_motivated_hyetograph(t: np.ndarray,
#                                            peak_mm_hr: float = 45.0,
#                                            peak_time: float = 10.0,
#                                            decay_rate: float = 8.0,
#                                            storm_type: str = "exponential") -> np.ndarray:
#     """
#     Generate synthetic hyetograph with multiple storm patterns.
   
#     Mathematical formulation:
#     - Exponential: P(t) = P_max * exp(-|t - t_peak|/λ)
#     - Gamma: P(t) = P_max * (t/t_peak)^α * exp(-α*t/t_peak)
#     - Double exponential: Combined rising and falling limbs
   
#     Args:
#         t: Time array
#         peak_mm_hr: Maximum rainfall intensity
#         peak_time: Time of peak intensity
#         decay_rate: Storm decay parameter
#         storm_type: Type of storm pattern
       
#     Returns:
#         Rainfall intensity array
       
#     Raises:
#         ValidationError: If parameters are invalid
#     """
#     if np.any(t < 0):
#         raise ValidationError("Time values must be non-negative")
#     if peak_mm_hr <= 0:
#         raise ValidationError("Peak rainfall must be positive")
   
#     logger.info(f"Generating {storm_type} hyetograph with peak {peak_mm_hr} mm/hr")
   
#     if storm_type == "exponential":
#         return peak_mm_hr * np.exp(-np.abs(t - peak_time) / decay_rate)
#     elif storm_type == "gamma":
#         alpha = 2.0  # Shape parameter
#         normalized_t = np.maximum(t / peak_time, 1e-10)
#         return peak_mm_hr * (normalized_t**alpha) * np.exp(-alpha * normalized_t)
#     elif storm_type == "double_exponential":
#         # Rising limb
#         rise_rate = decay_rate / 2
#         fall_rate = decay_rate
#         rising = np.where(t <= peak_time,
#                          peak_mm_hr * (1 - np.exp(-(t - 0) / rise_rate)),
#                          0)
#         falling = np.where(t > peak_time,
#                           peak_mm_hr * np.exp(-(t - peak_time) / fall_rate),
#                           0)
#         return rising + falling
#     else:
#         raise ValidationError(f"Unknown storm type: {storm_type}")

# def enhanced_kling_gupta_efficiency(obs: np.ndarray,
#                                   sim: np.ndarray,
#                                   weights: Optional[np.ndarray] = None) -> Tuple[float, Dict[str, float]]:
#     """
#     Enhanced KGE calculation with optional weighting and robust statistics.
   
#     Mathematical formulation:
#     KGE = 1 - √[(r-1)² + (α-1)² + (β-1)²]
   
#     Where:
#     - r: Pearson correlation coefficient
#     - α: Ratio of standard deviations (variability)
#     - β: Ratio of means (bias)
   
#     Args:
#         obs: Observed values
#         sim: Simulated values  
#         weights: Optional weights for robust statistics
       
#     Returns:
#         Tuple of (KGE value, components dictionary)
       
#     Raises:
#         ValidationError: If inputs are invalid
#     """
#     obs = np.asarray(obs, dtype=float)
#     sim = np.asarray(sim, dtype=float)
   
#     if obs.size != sim.size:
#         raise ValidationError("obs and sim must have same length")
   
#     # Handle missing values
#     valid_mask = ~np.isnan(obs) & ~np.isnan(sim) & np.isfinite(obs) & np.isfinite(sim)
#     if np.sum(valid_mask) < 3:
#         logger.warning("Insufficient valid data points for KGE calculation")
#         return np.nan, {"r": np.nan, "alpha": np.nan, "beta": np.nan, "n_valid": 0}
   
#     obs_valid = obs[valid_mask]
#     sim_valid = sim[valid_mask]
   
#     if weights is not None:
#         weights = weights[valid_mask]
#         weights = weights / np.sum(weights)  # Normalize weights
   
#     # Robust statistics
#     if weights is not None:
#         mu_o = np.average(obs_valid, weights=weights)
#         mu_s = np.average(sim_valid, weights=weights)
#         var_o = np.average((obs_valid - mu_o)**2, weights=weights)
#         var_s = np.average((sim_valid - mu_s)**2, weights=weights)
#         cov = np.average((obs_valid - mu_o) * (sim_valid - mu_s), weights=weights)
#     else:
#         mu_o = np.mean(obs_valid)
#         mu_s = np.mean(sim_valid)
#         var_o = np.var(obs_valid, ddof=1)
#         var_s = np.var(sim_valid, ddof=1)
#         cov = np.cov(obs_valid, sim_valid, ddof=1)[0, 1]
   
#     # Robust standard deviations
#     sigma_o = np.sqrt(var_o)
#     sigma_s = np.sqrt(var_s)
   
#     # Handle edge cases
#     if sigma_o < 1e-10 or sigma_s < 1e-10:
#         logger.warning("Near-zero variance detected in KGE calculation")
#         r = 0.0
#         alpha = 1.0 if sigma_o < 1e-10 else sigma_s / 1e-10
#     else:
#         r = cov / (sigma_o * sigma_s)
#         alpha = sigma_s / sigma_o
   
#     # Bias ratio with protection against division by zero
#     beta = mu_s / (mu_o + 1e-10 * np.sign(mu_o) if abs(mu_o) > 1e-10 else 1e-10)
   
#     # KGE calculation
#     KGE = 1.0 - np.sqrt((r - 1.0)**2 + (alpha - 1.0)**2 + (beta - 1.0)**2)
   
#     return KGE, {
#         "r": r,
#         "alpha": alpha,
#         "beta": beta,
#         "n_valid": np.sum(valid_mask),
#         "mu_obs": mu_o,
#         "mu_sim": mu_s,
#         "sigma_obs": sigma_o,
#         "sigma_sim": sigma_s
#     }

# def scs_runoff_with_uncertainty(P_mm: Union[float, np.ndarray],
#                                CN: Union[float, np.ndarray],
#                                lambda_ia: float = 0.2,
#                                antecedent_moisture: str = "AMC_II") -> Union[float, np.ndarray]:
#     """
#     Enhanced SCS runoff calculation with antecedent moisture conditions.
   
#     Mathematical formulation:
#     S = (25400/CN) - 254  [mm]
#     Ia = λ * S
#     Q = (P - Ia)²/(P - Ia + S)  for P > Ia, else Q = 0
   
#     Args:
#         P_mm: Precipitation depth(s) in mm
#         CN: Curve number(s)
#         lambda_ia: Initial abstraction ratio
#         antecedent_moisture: Antecedent Moisture Condition
       
#     Returns:
#         Runoff depth(s) in mm
       
#     Raises:
#         ValidationError: If parameters are invalid
#     """
#     # Validate inputs
#     P_mm = np.atleast_1d(P_mm)
#     CN = np.atleast_1d(CN)
   
#     if np.any(P_mm < 0):
#         raise ValidationError("Precipitation must be non-negative")
#     if np.any((CN < 30) | (CN > 100)):
#         raise ValidationError("CN must be between 30 and 100")
#     if not (0 < lambda_ia < 1):
#         raise ValidationError("Initial abstraction ratio must be in (0, 1)")
   
#     # Adjust CN for antecedent moisture conditions
#     CN_adjusted = CN.copy()
#     if antecedent_moisture == "AMC_I":  # Dry conditions
#         CN_adjusted = CN / (2.334 - 0.01334 * CN)
#     elif antecedent_moisture == "AMC_III":  # Wet conditions  
#         CN_adjusted = CN / (0.427 + 0.00573 * CN)
   
#     # SCS calculations with vectorization
#     S = 25400.0 / CN_adjusted - 254.0  # Maximum potential retention
#     Ia = lambda_ia * S  # Initial abstraction
   
#     # Runoff calculation
#     excess = np.maximum(P_mm - Ia, 0)
#     Q = np.where(excess > 0, excess**2 / (excess + S), 0)
   
#     return Q.item() if Q.size == 1 else Q

# def triangular_unit_hydrograph_enhanced(t_grid: np.ndarray,
#                                       t_peak: float = 4.0,
#                                       t_base: float = 18.0,
#                                       validate_volume: bool = True) -> np.ndarray:
#     """
#     Enhanced triangular unit hydrograph with volume validation.
   
#     Mathematical formulation:
#     UH(t) = {
#         t/t_p                    for 0 ≤ t ≤ t_p
#         (t_b - t)/(t_b - t_p)    for t_p < t ≤ t_b  
#         0                        otherwise
#     }
   
#     With constraint: ∫UH(t)dt = 1
   
#     Args:
#         t_grid: Time grid
#         t_peak: Time to peak
#         t_base: Base time
#         validate_volume: Whether to validate unit volume
       
#     Returns:
#         Unit hydrograph ordinates
       
#     Raises:
#         ValidationError: If parameters violate physical constraints
#     """
#     if t_peak <= 0 or t_base <= t_peak:
#         raise ValidationError(f"Invalid UH timing: t_peak={t_peak}, t_base={t_base}")
   
#     dt = np.mean(np.diff(t_grid)) if len(t_grid) > 1 else 1.0
#     UH = np.zeros_like(t_grid)
   
#     # Vectorized calculation
#     t_rel = t_grid - t_grid[0]  # Relative time
   
#     # Rising limb
#     rising_mask = (t_rel >= 0) & (t_rel <= t_peak)
#     UH[rising_mask] = t_rel[rising_mask] / t_peak
   
#     # Falling limb
#     falling_mask = (t_rel > t_peak) & (t_rel <= t_base)
#     UH[falling_mask] = (t_base - t_rel[falling_mask]) / (t_base - t_peak)
   
#     # Volume normalization
#     volume = np.trapz(UH, dx=dt)
#     if volume > 1e-10:
#         UH = UH / volume
#     else:
#         raise NumericalError("Unit hydrograph has zero volume")
   
#     # Validation
#     if validate_volume:
#         final_volume = np.trapz(UH, dx=dt)
#         if abs(final_volume - 1.0) > 1e-3:
#             logger.warning(f"UH volume validation failed: {final_volume:.6f}")
   
#     logger.info(f"Generated triangular UH: t_peak={t_peak}, t_base={t_base}, volume={np.trapz(UH, dx=dt):.6f}")
   
#     return UH

# def physically_motivated_lorenz_system(t: float,
#                                      state: np.ndarray,
#                                      hydrological_forcing: Callable,
#                                      params: Dict[str, float]) -> List[float]:
#     """
#     Physically-motivated augmented Lorenz system for hydrological modeling.
   
#     State Variables (Physical Interpretation):
#     - x: Normalized discharge anomaly (dimensionless)
#     - y: Energy dissipation rate (1/time)  
#     - z: Channel storage index (dimensionless)
#     - w: Groundwater-surface water exchange (mm/time)
   
#     Mathematical System:
#     dx/dt = σ(y - x) + γ*R(t) + α*noise
#     dy/dt = x(ρ - z) - y + μ*storage_feedback
#     dz/dt = xy - βz + κ*channel_dynamics  
#     dw/dt = -κw + μy + groundwater_coupling
   
#     Where R(t) is the normalized hydrological forcing.
   
#     Args:
#         t: Current time
#         state: Current state vector [x, y, z, w]
#         hydrological_forcing: Function returning normalized forcing
#         params: System parameters
       
#     Returns:
#         State derivatives
#     """
#     x, y, z, w = state
   
#     # Extract parameters with defaults
#     sigma = params.get("sigma", 10.0)
#     rho = params.get("rho", 28.0)
#     beta = params.get("beta", 8.0/3.0)
#     gamma = params.get("gamma", 0.015)
#     kappa = params.get("kappa", 0.12)
#     mu = params.get("mu", 0.008)
#     alpha = params.get("alpha", 0.25)
   
#     # Get current hydrological forcing
#     try:
#         R_t = float(hydrological_forcing(t))
#     except:
#         R_t = 0.0  # Fallback for extrapolation
   
#     # Bounded forcing to prevent numerical instabilities
#     R_t = np.clip(R_t, -5.0, 5.0)
   
#     # Physical constraints and nonlinearities
#     storage_feedback = np.tanh(0.5 * w)  # Bounded storage effect
#     channel_dynamics = 0.1 * np.sin(0.2 * t)  # Periodic channel variations
#     groundwater_coupling = 0.05 * (x**2 - w)  # Nonlinear coupling
   
#     # System equations with physical interpretations
#     dx_dt = sigma * (y - x) + gamma * R_t + alpha * storage_feedback
#     dy_dt = x * (rho - z) - y + mu * storage_feedback  
#     dz_dt = x * y - beta * z + kappa * channel_dynamics
#     dw_dt = -kappa * w + mu * y + groundwater_coupling
   
#     return [dx_dt, dy_dt, dz_dt, dw_dt]

# def integrate_coupled_system(t_grid: np.ndarray,
#                            initial_state: np.ndarray,
#                            hydrological_forcing: np.ndarray,
#                            lorenz_params: Dict[str, float],
#                            method: str = "RK45") -> np.ndarray:
#     """
#     Robust integration of the coupled hydrological-chaos system.
   
#     Args:
#         t_grid: Time grid for integration
#         initial_state: Initial conditions [x0, y0, z0, w0]
#         hydrological_forcing: Normalized hydrological forcing series
#         lorenz_params: Lorenz system parameters
#         method: Integration method
       
#     Returns:
#         State evolution array (4 x n_times)
       
#     Raises:
#         NumericalError: If integration fails
#     """
#     if len(initial_state) != 4:
#         raise ValidationError("Initial state must have 4 components")
   
#     # Create interpolation function for forcing
#     forcing_func = lambda t: np.interp(t, t_grid, hydrological_forcing)
   
#     # Define RHS function
#     def rhs(t, state):
#         return physically_motivated_lorenz_system(t, state, forcing_func, lorenz_params)
   
#     # Integration with error handling
#     try:
#         sol = solve_ivp(
#             rhs,
#             (t_grid[0], t_grid[-1]),
#             initial_state,
#             t_eval=t_grid,
#             method=method,
#             rtol=1e-8,
#             atol=1e-11,
#             max_step=np.min(np.diff(t_grid)) / 2,
#             first_step=np.min(np.diff(t_grid)) / 10
#         )
       
#         if not sol.success:
#             logger.error(f"Integration failed: {sol.message}")
#             raise NumericalError(f"ODE integration failed: {sol.message}")
           
#         # Check for numerical stability
#         if np.any(~np.isfinite(sol.y)):
#             raise NumericalError("Integration produced non-finite values")
           
#         return sol.y
       
#     except Exception as e:
#         logger.error(f"Integration error: {str(e)}")
#         raise NumericalError(f"Integration failed: {str(e)}")

# def physical_observation_operator(states: np.ndarray,
#                                 base_discharge: np.ndarray,
#                                 observation_params: Optional[Dict] = None) -> np.ndarray:
#     """
#     Physically-motivated observation operator linking chaos states to observables.
   
#     Mathematical formulation:
#     Q_obs(t) = Q_base(t) * [1 + α₁*tanh(w(t)) + α₂*sigmoid(y(t)) + α₃*x(t)]
   
#     Physical interpretation:
#     - Base discharge modified by:
#       - Groundwater contribution: α₁*tanh(w)
#       - Energy dissipation effect: α₂*sigmoid(y)  
#       - Direct discharge anomaly: α₃*x
   
#     Args:
#         states: State matrix (4 x n_times)
#         base_discharge: Base hydrological discharge
#         observation_params: Parameters for observation operator
       
#     Returns:
#         Observable discharge time series
#     """
#     if observation_params is None:
#         observation_params = {
#             "alpha1": 0.25,  # Groundwater contribution strength
#             "alpha2": 0.15,  # Energy dissipation effect
#             "alpha3": 0.10,  # Direct anomaly contribution
#             "beta": 2.0      # Sigmoid steepness
#         }
   
#     x, y, z, w = states[0, :], states[1, :], states[2, :], states[3, :]
   
#     # Physical components
#     groundwater_contrib = observation_params["alpha1"] * np.tanh(w)
#     energy_effect = observation_params["alpha2"] * (2 / (1 + np.exp(-observation_params["beta"] * y)) - 1)
#     direct_anomaly = observation_params["alpha3"] * np.tanh(x)
   
#     # Combined observation
#     multiplicative_factor = 1.0 + groundwater_contrib + energy_effect + direct_anomaly
   
#     # Ensure physical realizability (discharge must be non-negative)
#     multiplicative_factor = np.maximum(multiplicative_factor, 0.1)
   
#     return base_discharge * multiplicative_factor

# class EnhancedParticleFilter:
#     """
#     Enhanced Sequential Monte Carlo implementation with adaptive resampling
#     and parameter estimation.
#     """
   
#     def __init__(self,
#                  n_particles: int,
#                  param_bounds: Dict[str, Tuple[float, float]],
#                  resampling_threshold: float = 0.5,
#                  adaptive_inflation: bool = True,
#                  seed: Optional[int] = None):
#         """
#         Initialize the particle filter.
       
#         Args:
#             n_particles: Number of particles
#             param_bounds: Parameter bounds dictionary
#             resampling_threshold: ESS threshold for resampling
#             adaptive_inflation: Whether to use adaptive parameter inflation
#             seed: Random seed for reproducibility
#         """
#         self.n_particles = n_particles
#         self.param_bounds = param_bounds
#         self.resampling_threshold = resampling_threshold
#         self.adaptive_inflation = adaptive_inflation
#         self.seed = seed
       
#         # Initialize random number generator
#         self.rng = np.random.default_rng(seed)
       
#         # Initialize particles
#         self.particles = self._initialize_particles()
       
#         # Diagnostics
#         self.ess_history = []
#         self.weight_history = []
#         self.parameter_evolution = {key: [] for key in param_bounds.keys()}
       
#         logger.info(f"Initialized particle filter with {n_particles} particles")
   
#     def _initialize_particles(self) -> List[Dict]:
#         """Initialize particle ensemble using Latin Hypercube Sampling."""
#         keys = list(self.param_bounds.keys())
#         n_dims = len(keys)
       
#         # Latin Hypercube sampling
#         sampler = qmc.LatinHypercube(d=n_dims, seed=self.seed)
#         samples = sampler.random(self.n_particles)
       
#         # Scale to parameter bounds
#         l_bounds = np.array([self.param_bounds[k][0] for k in keys])
#         u_bounds = np.array([self.param_bounds[k][1] for k in keys])
#         scaled_samples = qmc.scale(samples, l_bounds, u_bounds)
       
#         particles = []
#         for i, sample in enumerate(scaled_samples):
#             particle = {
#                 "id": i,
#                 "weight": 1.0 / self.n_particles,
#                 "log_weight": -np.log(self.n_particles),
#                 "parameters": {},
#                 "state": None,
#                 "likelihood": 0.0
#             }
           
#             # Assign parameters
#             for j, key in enumerate(keys):
#                 particle["parameters"][key] = sample[j]
           
#             # Initialize state based on parameters
#             if all(k in keys for k in ["y0_x", "y0_y", "y0_z", "y0_w"]):
#                 particle["state"] = np.array([
#                     particle["parameters"]["y0_x"],
#                     particle["parameters"]["y0_y"],
#                     particle["parameters"]["y0_z"],
#                     particle["parameters"]["y0_w"]
#                 ])
#             else:
#                 particle["state"] = np.array([0.0, 1.0, 20.0, 0.0])  # Default
           
#             particles.append(particle)
       
#         return particles
   
#     def effective_sample_size(self) -> float:
#         """Calculate effective sample size."""
#         weights = np.array([p["weight"] for p in self.particles])
#         return 1.0 / np.sum(weights**2)
   
#     def update_weights(self,
#                       observations: np.ndarray,
#                       forecasts: np.ndarray,
#                       observation_error: Union[float, np.ndarray]) -> None:
#         """
#         Update particle weights using Bayesian inference.
       
#         Args:
#             observations: Observation values
#             forecasts: Forecast values for each particle
#             observation_error: Observation error variance(s)
#         """
#         n_obs = len(observations)
#         observation_error = np.atleast_1d(observation_error)
       
#         if len(observation_error) == 1:
#             observation_error = np.repeat(observation_error, n_obs)
       
#         # Update each particle
#         for i, particle in enumerate(self.particles):
#             if i < len(forecasts):
#                 # Calculate likelihood for each observation
#                 residuals = observations - forecasts[i]
#                 log_likelihood = -0.5 * np.sum(residuals**2 / observation_error) - \
#                                0.5 * np.sum(np.log(2 * np.pi * observation_error))
               
#                 # Update log weight
#                 particle["log_weight"] += log_likelihood
#                 particle["likelihood"] = log_likelihood
       
#         # Normalize weights (in log space for numerical stability)
#         log_weights = np.array([p["log_weight"] for p in self.particles])
#         max_log_weight = np.max(log_weights)
       
#         # Subtract maximum for numerical stability
#         normalized_log_weights = log_weights - max_log_weight
#         weights = np.exp(normalized_log_weights)
#         weight_sum = np.sum(weights)
       
#         if weight_sum > 0:
#             for i, particle in enumerate(self.particles):
#                 particle["weight"] = weights[i] / weight_sum
#         else:
#             # Fallback: uniform weights
#             for particle in self.particles:
#                 particle["weight"] = 1.0 / self.n_particles
       
#         # Store diagnostics
#         current_weights = [p["weight"] for p in self.particles]
#         self.weight_history.append(current_weights.copy())
#         self.ess_history.append(self.effective_sample_size())
   
#     def resample(self) -> bool:
#         """
#         Adaptive resampling based on effective sample size.
       
#         Returns:
#             True if resampling was performed
#         """
#         ess = self.effective_sample_size()
#         threshold = self.resampling_threshold * self.n_particles
       
#         if ess < threshold:
#             weights = np.array([p["weight"] for p in self.particles])
           
#             # Systematic resampling
#             indices = self._systematic_resample(weights)
           
#             # Create new particle set
#             new_particles = []
#             for idx in indices:
#                 new_particle = self.particles[idx].copy()
#                 new_particle["weight"] = 1.0 / self.n_particles
#                 new_particle["log_weight"] = -np.log(self.n_particles)
               
#                 # Deep copy of state and parameters
#                 new_particle["state"] = self.particles[idx]["state"].copy()
#                 new_particle["parameters"] = self.particles[idx]["parameters"].copy()
               
#                 new_particles.append(new_particle)
           
#             self.particles = new_particles
           
#             # Parameter inflation for diversity
#             if self.adaptive_inflation:
#                 self._inflate_parameters()
           
#             logger.debug(f"Resampled particles (ESS: {ess:.2f})")
#             return True
       
#         return False
   
#     def _systematic_resample(self, weights: np.ndarray) -> np.ndarray:
#         """Systematic resampling algorithm."""
#         n = len(weights)
#         indices = np.zeros(n, dtype=int)
       
#         # Cumulative sum
#         cumsum = np.cumsum(weights)
       
#         # Systematic sampling
#         u0 = self.rng.uniform(0, 1/n)
#         j = 0
       
#         for i in range(n):
#             u = u0 + i / n
#             while cumsum[j] < u:
#                 j += 1
#             indices[i] = j
       
#         return indices
   
#     def _inflate_parameters(self, inflation_factor: float = 0.02) -> None:
#         """Apply parameter inflation to maintain ensemble diversity."""
#         for key in self.param_bounds.keys():
#             if key.startswith('y0_') or key in ['rho', 'gamma', 'kappa', 'mu', 'Cn']:
#                 values = [p["parameters"][key] for p in self.particles]
#                 mean_val = np.mean(values)
#                 std_val = np.std(values)
               
#                 # Inflate around mean
#                 for particle in self.particles:
#                     noise = self.rng.normal(0, inflation_factor * std_val)
#                     new_val = particle["parameters"][key] + noise
                   
#                     # Ensure bounds
#                     bounds = self.param_bounds[key]
#                     particle["parameters"][key] = np.clip(new_val, bounds[0], bounds[1])
   
#     def get_ensemble_statistics(self) -> Dict[str, np.ndarray]:
#         """Calculate ensemble statistics."""
#         stats = {}
       
#         # Parameter statistics
#         for key in self.param_bounds.keys():
#             values = [p["parameters"][key] for p in self.particles]
#             weights = [p["weight"] for p in self.particles]
           
#             stats[key] = {
#                 "mean": np.average(values, weights=weights),
#                 "std": np.sqrt(np.average((values - np.average(values, weights=weights))**2, weights=weights)),
#                 "median": np.percentile(values, 50),
#                 "q05": np.percentile(values, 5),
#                 "q95": np.percentile(values, 95)
#             }
       
#         return stats

# class ModelValidation:
#     """Comprehensive model validation framework."""
   
#     def __init__(self, observations: np.ndarray, predictions: np.ndarray, time_grid: np.ndarray):
#         """
#         Initialize validation framework.
       
#         Args:
#             observations: Observed values
#             predictions: Model predictions (ensemble)
#             time_grid: Time grid
#         """
#         self.observations = observations
#         self.predictions = predictions
#         self.time_grid = time_grid
#         self.metrics = {}
   
#     def calculate_all_metrics(self) -> Dict[str, float]:
#         """Calculate comprehensive validation metrics."""
#         # Ensemble median
#         pred_median = np.median(self.predictions, axis=0)
       
#         # KGE and components
#         kge, kge_components = enhanced_kling_gupta_efficiency(self.observations, pred_median)
#         self.metrics.update({"KGE": kge, **kge_components})
       
#         # Nash-Sutcliffe Efficiency
#         nse = self._nash_sutcliffe_efficiency(self.observations, pred_median)
#         self.metrics["NSE"] = nse
       
#         # Percent Bias
#         pbias = self._percent_bias(self.observations, pred_median)
#         self.metrics["PBIAS"] = pbias
       
#         # Root Mean Square Error
#         rmse = self._rmse(self.observations, pred_median)
#         self.metrics["RMSE"] = rmse
       
#         # Mean Absolute Error
#         mae = self._mae(self.observations, pred_median)
#         self.metrics["MAE"] = mae
       
#         # Probabilistic metrics
#         crps = self._continuous_ranked_probability_score()
#         self.metrics["CRPS"] = crps
       
#         # Coverage metrics
#         coverage_90 = self._prediction_interval_coverage(0.9)
#         coverage_95 = self._prediction_interval_coverage(0.95)
#         self.metrics["Coverage_90"] = coverage_90
#         self.metrics["Coverage_95"] = coverage_95
       
#         # Reliability metrics
#         reliability = self._reliability_score()
#         self.metrics["Reliability"] = reliability
       
#         logger.info("Calculated comprehensive validation metrics")
#         return self.metrics
   
#     def _nash_sutcliffe_efficiency(self, obs: np.ndarray, sim: np.ndarray) -> float:
#         """Calculate Nash-Sutcliffe Efficiency."""
#         valid_mask = ~np.isnan(obs) & ~np.isnan(sim)
#         if np.sum(valid_mask) < 2:
#             return np.nan
       
#         obs_valid = obs[valid_mask]
#         sim_valid = sim[valid_mask]
       
#         numerator = np.sum((obs_valid - sim_valid)**2)
#         denominator = np.sum((obs_valid - np.mean(obs_valid))**2)
       
#         return 1 - (numerator / (denominator + 1e-10))
   
#     def _percent_bias(self, obs: np.ndarray, sim: np.ndarray) -> float:
#         """Calculate Percent Bias."""
#         valid_mask = ~np.isnan(obs) & ~np.isnan(sim)
#         if np.sum(valid_mask) < 2:
#             return np.nan
       
#         obs_valid = obs[valid_mask]
#         sim_valid = sim[valid_mask]
       
#         return 100 * np.sum(sim_valid - obs_valid) / (np.sum(obs_valid) + 1e-10)
   
#     def _rmse(self, obs: np.ndarray, sim: np.ndarray) -> float:
#         """Calculate Root Mean Square Error."""
#         valid_mask = ~np.isnan(obs) & ~np.isnan(sim)
#         if np.sum(valid_mask) < 2:
#             return np.nan
       
#         obs_valid = obs[valid_mask]
#         sim_valid = sim[valid_mask]
       
#         return np.sqrt(np.mean((obs_valid - sim_valid)**2))
   
#     def _mae(self, obs: np.ndarray, sim: np.ndarray) -> float:
#         """Calculate Mean Absolute Error."""
#         valid_mask = ~np.isnan(obs) & ~np.isnan(sim)
#         if np.sum(valid_mask) < 2:
#             return np.nan
       
#         obs_valid = obs[valid_mask]
#         sim_valid = sim[valid_mask]
       
#         return np.mean(np.abs(obs_valid - sim_valid))
   
#     def _continuous_ranked_probability_score(self) -> float:
#         """Calculate Continuous Ranked Probability Score."""
#         crps_values = []
       
#         for i in range(len(self.observations)):
#             if not np.isnan(self.observations[i]):
#                 ensemble = self.predictions[:, i]
#                 ensemble = ensemble[~np.isnan(ensemble)]
               
#                 if len(ensemble) > 0:
#                     crps_val = self._crps_single(self.observations[i], ensemble)
#                     crps_values.append(crps_val)
       
#         return np.mean(crps_values) if crps_values else np.nan
   
#     def _crps_single(self, observation: float, ensemble: np.ndarray) -> float:
#         """Calculate CRPS for single observation."""
#         ensemble_sorted = np.sort(ensemble)
#         n = len(ensemble_sorted)
       
#         # Empirical CDF
#         p_values = np.arange(1, n+1) / n
       
#         # Heaviside function
#         heaviside = (ensemble_sorted <= observation).astype(float)
       
#         # Integrate
#         crps = np.trapz((p_values - heaviside)**2, ensemble_sorted)
       
#         return crps
   
#     def _prediction_interval_coverage(self, confidence_level: float) -> float:
#         """Calculate prediction interval coverage."""
#         alpha = 1 - confidence_level
#         lower_quantile = alpha / 2
#         upper_quantile = 1 - alpha / 2
       
#         coverage_count = 0
#         valid_count = 0
       
#         for i in range(len(self.observations)):
#             if not np.isnan(self.observations[i]):
#                 ensemble = self.predictions[:, i]
#                 ensemble = ensemble[~np.isnan(ensemble)]
               
#                 if len(ensemble) > 0:
#                     lower_bound = np.percentile(ensemble, lower_quantile * 100)
#                     upper_bound = np.percentile(ensemble, upper_quantile * 100)
                   
#                     if lower_bound <= self.observations[i] <= upper_bound:
#                         coverage_count += 1
#                     valid_count += 1
       
#         return coverage_count / valid_count if valid_count > 0 else np.nan
   
#     def _reliability_score(self) -> float:
#         """Calculate reliability score for probabilistic forecasts."""
#         # Implement rank histogram-based reliability
#         rank_counts = np.zeros(self.predictions.shape[0] + 1)
#         total_count = 0
       
#         for i in range(len(self.observations)):
#             if not np.isnan(self.observations[i]):
#                 ensemble = self.predictions[:, i]
#                 ensemble = ensemble[~np.isnan(ensemble)]
               
#                 if len(ensemble) > 0:
#                     # Find rank of observation in ensemble
#                     combined = np.append(ensemble, self.observations[i])
#                     sorted_indices = np.argsort(combined)
#                     obs_rank = np.where(sorted_indices == len(ensemble))[0][0]
                   
#                     rank_counts[obs_rank] += 1
#                     total_count += 1
       
#         if total_count > 0:
#             expected_freq = total_count / len(rank_counts)
#             chi_square = np.sum((rank_counts - expected_freq)**2 / expected_freq)
#             return 1 - chi_square / (len(rank_counts) - 1)  # Normalized reliability
#         else:
#             return np.nan

# def run_enhanced_simulation(config: Optional[ModelParameters] = None,
#                           save_results: bool = True,
#                           output_dir: str = "results") -> Dict:
#     """
#     Run enhanced hydrological simulation with comprehensive analysis.
   
#     Args:
#         config: Model configuration parameters
#         save_results: Whether to save results to files
#         output_dir: Output directory for results
       
#     Returns:
#         Dictionary containing simulation results and diagnostics
#     """
#     if config is None:
#         config = ModelParameters()
   
#     logger.info("=== Enhanced Hydrological Simulation with Chaos Theory ===")
#     logger.info(f"Configuration: CN={config.CN}, Area={config.area_km2} km²")
   
#     # Create output directory
#     if save_results:
#         Path(output_dir).mkdir(exist_ok=True)
   
#     # Time setup
#     dt = 1.0  # hours
#     t_total_hours = 48
#     t = np.arange(0, t_total_hours + dt, dt)
   
#     # Generate synthetic hyetograph
#     logger.info("Generating synthetic storm...")
#     hyet = generate_physically_motivated_hyetograph(
#         t,
#         peak_mm_hr=config.peak_mm_hr,
#         peak_time=config.peak_time,
#         decay_rate=config.decay_rate,
#         storm_type="exponential"
#     )
   
#     # Hydrological modeling
#     logger.info("Running hydrological model...")
#     area_m2 = config.area_km2 * 1e6
   
#     # Enhanced SCS runoff calculation
#     pe = scs_runoff_with_uncertainty(
#         hyet,
#         config.CN,
#         lambda_ia=config.lambda_ia,
#         antecedent_moisture="AMC_II"
#     )
   
#     # Unit hydrograph routing
#     uh = triangular_unit_hydrograph_enhanced(
#         t,
#         t_peak=config.t_peak_hours,
#         t_base=config.t_base_hours
#     )
   
#     # Route runoff
#     conv = np.convolve(pe, uh)[:len(pe)]
#     V_m3_per_dt = conv / 1000.0 * area_m2
#     q_base = V_m3_per_dt / (dt * 3600.0)
   
#     # Normalize for Lorenz forcing
#     q_mean = np.mean(q_base)
#     q_std = np.std(q_base)
#     if q_std < 1e-9:
#         q_std = 1.0
#     r_normalized = np.tanh((q_base - q_mean) / q_std)
   
#     # Generate true state evolution
#     logger.info("Integrating coupled chaos-hydrology system...")
#     initial_state = np.array([0.0, 1.0, 20.0, 0.0])
   
#     try:
#         states_true = integrate_coupled_system(
#             t,
#             initial_state,
#             r_normalized,
#             config.lorenz_params
#         )
#     except NumericalError as e:
#         logger.error(f"Integration failed: {e}")
#         return {"error": str(e)}
   
#     # Generate synthetic observations
#     logger.info("Generating synthetic observations...")
#     Q_true = physical_observation_operator(states_true, q_base)
   
#     # Add observation noise
#     rng = np.random.default_rng(42)
#     obs_noise_std = config.obs_error_base * np.maximum(np.abs(Q_true), config.obs_error_min)
#     Q_obs = Q_true + rng.normal(0, obs_noise_std)
   
#     # Sequential Monte Carlo Data Assimilation
#     logger.info("Running Enhanced Sequential Monte Carlo...")
   
#     # Parameter bounds for estimation
#     param_bounds = {
#         "rho": (24.0, 32.0),
#         "gamma": (0.005, 0.025),
#         "kappa": (0.08, 0.15),
#         "mu": (0.005, 0.015),
#         "y0_x": (-1.0, 1.0),
#         "y0_y": (0.5, 1.5),
#         "y0_z": (18.0, 22.0),
#         "y0_w": (-0.5, 0.5),
#         "Cn": (config.CN - 10, config.CN + 10)
#     }
   
#     # Initialize particle filter
#     pf = EnhancedParticleFilter(
#         n_particles=config.n_particles,
#         param_bounds=param_bounds,
#         resampling_threshold=config.resampling_threshold,
#         adaptive_inflation=True,
#         seed=123
#     )
   
#     # Storage for results
#     ensemble_forecasts = np.full((config.n_particles, len(t)), np.nan)
#     resampling_times = []
   
#     # Assimilation loop
#     logger.info("Performing data assimilation...")
#     for i in range(1, len(t)):
#         if i % 10 == 0:
#             logger.info(f"Processing timestep {i}/{len(t)}")
       
#         # Forecast step for each particle
#         forecasts = []
#         valid_particles = []
       
#         for j, particle in enumerate(pf.particles):
#             try:
#                 # Get particle-specific parameters
#                 lorenz_params_particle = config.lorenz_params.copy()
#                 lorenz_params_particle.update({
#                     "rho": particle["parameters"]["rho"],
#                     "gamma": particle["parameters"]["gamma"],
#                     "kappa": particle["parameters"]["kappa"],
#                     "mu": particle["parameters"]["mu"]
#                 })
               
#                 CN_particle = particle["parameters"]["Cn"]
               
#                 # Compute particle-specific runoff
#                 pe_particle = scs_runoff_with_uncertainty(
#                     hyet[i-1:i+1],
#                     CN_particle,
#                     lambda_ia=config.lambda_ia
#                 )
               
#                 # Route through UH
#                 if len(pe_particle) > 1:
#                     uh_window = uh[max(0, i-len(pe_particle)+1):i+1]
#                     if len(uh_window) < len(pe_particle):
#                         uh_window = np.pad(uh_window, (len(pe_particle) - len(uh_window), 0))
#                     conv_particle = np.sum(pe_particle * uh_window[::-1])
#                 else:
#                     conv_particle = pe_particle[0] * uh[i] if i < len(uh) else 0
               
#                 V_particle = conv_particle / 1000.0 * area_m2
#                 q_particle = V_particle / (dt * 3600.0)
               
#                 # Normalize forcing
#                 r_particle = np.tanh((q_particle - q_mean) / q_std)
               
#                 # Integrate one timestep
#                 y0_particle = particle["state"]
               
#                 states_particle = integrate_coupled_system(
#                     t[i-1:i+1],
#                     y0_particle,
#                     np.array([r_normalized[i-1], r_particle]),
#                     lorenz_params_particle
#                 )
               
#                 # Update particle state
#                 particle["state"] = states_particle[:, -1]
               
#                 # Generate observation
#                 q_base_current = np.interp(t[i], t, q_base)
#                 forecast = physical_observation_operator(
#                     states_particle[:, -1:],
#                     np.array([q_base_current])
#                 )[0]
               
#                 forecasts.append(forecast)
#                 ensemble_forecasts[j, i] = forecast
#                 valid_particles.append(j)
               
#             except Exception as e:
#                 logger.warning(f"Particle {j} failed at timestep {i}: {str(e)}")
#                 forecasts.append(np.nan)
#                 ensemble_forecasts[j, i] = np.nan
       
#         # Update weights if observations available
#         if not np.isnan(Q_obs[i]) and len(forecasts) > 0:
#             valid_forecasts = [f for f in forecasts if not np.isnan(f)]
#             if len(valid_forecasts) > 0:
#                 obs_error = obs_noise_std[i]**2
#                 pf.update_weights(
#                     np.array([Q_obs[i]]),
#                     np.array(valid_forecasts),
#                     obs_error
#                 )
               
#                 # Adaptive resampling
#                 if pf.resample():
#                     resampling_times.append(i)
   
#     logger.info("Data assimilation completed successfully")
   
#     # Calculate ensemble statistics
#     ensemble_median = np.nanmedian(ensemble_forecasts, axis=0)
#     ensemble_mean = np.nanmean(ensemble_forecasts, axis=0)
#     ensemble_std = np.nanstd(ensemble_forecasts, axis=0)
#     ensemble_p05 = np.nanpercentile(ensemble_forecasts, 5, axis=0)
#     ensemble_p95 = np.nanpercentile(ensemble_forecasts, 95, axis=0)
   
#     # Comprehensive validation
#     logger.info("Performing comprehensive validation...")
#     validator = ModelValidation(Q_obs, ensemble_forecasts, t)
#     validation_metrics = validator.calculate_all_metrics()
   
#     # Parameter estimation results
#     param_stats = pf.get_ensemble_statistics()
   
#     # Print results
#     logger.info("\n" + "="*50)
#     logger.info("SIMULATION RESULTS")
#     logger.info("="*50)
#     logger.info(f"KGE: {validation_metrics['KGE']:.4f}")
#     logger.info(f"NSE: {validation_metrics['NSE']:.4f}")
#     logger.info(f"CRPS: {validation_metrics['CRPS']:.4f}")
#     logger.info(f"Coverage (90%): {validation_metrics['Coverage_90']:.1%}")
#     logger.info(f"Coverage (95%): {validation_metrics['Coverage_95']:.1%}")
#     logger.info(f"Reliability: {validation_metrics['Reliability']:.4f}")
#     logger.info(f"Resampling events: {len(resampling_times)}")
   
#     # Create comprehensive plots
#     logger.info("Generating plots...")
   
#     # Main results plot
#     fig, axes = plt.subplots(3, 2, figsize=(16, 12))
   
#     # Hyetograph and base runoff
#     axes[0,0].bar(t, hyet, width=0.8, color='skyblue', alpha=0.7, label='Rainfall (mm/hr)')
#     axes[0,0].plot(t, q_base, 'g-', linewidth=2, label='Base Runoff (m³/s)')
#     axes[0,0].set_ylabel('Rainfall (mm/hr) / Flow (m³/s)')
#     axes[0,0].legend()
#     axes[0,0].set_title('Hyetograph and Hydrological Response')
#     axes[0,0].grid(True, alpha=0.3)
   
#     # Ensemble forecast
#     axes[0,1].fill_between(t, ensemble_p05, ensemble_p95,
#                           color='lightblue', alpha=0.5, label='90% CI')
#     axes[0,1].plot(t, ensemble_median, 'b-', linewidth=2, label='Ensemble Median')
#     axes[0,1].plot(t, Q_obs, 'ro-', markersize=3, label='Observations')
#     axes[0,1].plot(t, Q_true, 'k--', alpha=0.7, label='Truth')
#     axes[0,1].set_ylabel('Discharge')
#     axes[0,1].legend()
#     axes[0,1].set_title('Ensemble Forecast vs Observations')
#     axes[0,1].grid(True, alpha=0.3)
   
#     # Lorenz attractor
#     axes[1,0].plot(states_true[0,:], states_true[1,:], 'b-', alpha=0.7)
#     axes[1,0].scatter(states_true[0,0], states_true[1,0], c='green', s=50, label='Start')
#     axes[1,0].scatter(states_true[0,-1], states_true[1,-1], c='red', s=50, label='End')
#     axes[1,0].set_xlabel('X (Discharge Anomaly)')
#     axes[1,0].set_ylabel('Y (Energy Dissipation)')
#     axes[1,0].set_title('Phase Space Trajectory (X-Y)')
#     axes[1,0].legend()
#     axes[1,0].grid(True, alpha=0.3)
   
#     # Parameter evolution
#     rho_values = [param_stats['rho']['mean']] * len(t)
#     axes[1,1].plot(t, rho_values, 'r-', label=f"ρ = {param_stats['rho']['mean']:.2f}±{param_stats['rho']['std']:.2f}")
#     gamma_values = [param_stats['gamma']['mean']] * len(t)
#     axes[1,1].plot(t, gamma_values, 'b-', label=f"γ = {param_stats['gamma']['mean']:.3f}±{param_stats['gamma']['std']:.3f}")
#     axes[1,1].set_ylabel('Parameter Values')
#     axes[1,1].set_title('Estimated Parameters')
#     axes[1,1].legend()
#     axes[1,1].grid(True, alpha=0.3)
   
#     # Residuals analysis
#     residuals = Q_obs - ensemble_median
#     axes[2,0].scatter(ensemble_median, residuals, alpha=0.6)
#     axes[2,0].axhline(y=0, color='r', linestyle='--')
#     axes[2,0].set_xlabel('Predicted')
#     axes[2,0].set_ylabel('Residuals')
#     axes[2,0].set_title('Residual Analysis')
#     axes[2,0].grid(True, alpha=0.3)
   
#     # Effective sample size
#     axes[2,1].plot(pf.ess_history, 'g-', linewidth=2)
#     axes[2,1].axhline(y=pf.resampling_threshold * config.n_particles,
#                      color='r', linestyle='--', label='Resampling Threshold')
#     for rt in resampling_times:
#         axes[2,1].axvline(x=rt, color='orange', alpha=0.5)
#     axes[2,1].set_ylabel('Effective Sample Size')
#     axes[2,1].set_xlabel('Time Step')
#     axes[2,1].set_title('Particle Filter Diagnostics')
#     axes[2,1].legend()
#     axes[2,1].grid(True, alpha=0.3)
   
#     plt.tight_layout()
#     if save_results:
#         plt.savefig(f"{output_dir}/enhanced_simulation_results.png", dpi=300, bbox_inches='tight')
#     plt.show()
   
#     # 3D Lorenz plot
#     fig_3d = plt.figure(figsize=(12, 8))
#     ax_3d = fig_3d.add_subplot(111, projection='3d')
#     ax_3d.plot(states_true[0,:], states_true[1,:], states_true[2,:], 'b-', alpha=0.7)
#     ax_3d.scatter(states_true[0,0], states_true[1,0], states_true[2,0],
#                  c='green', s=100, label='Start')
#     ax_3d.scatter(states_true[0,-1], states_true[1,-1], states_true[2,-1],
#                  c='red', s=100, label='End')
#     ax_3d.set_xlabel('X (Discharge Anomaly)')
#     ax_3d.set_ylabel('Y (Energy Dissipation)')
#     ax_3d.set_zlabel('Z (Storage Index)')
#     ax_3d.set_title('3D Lorenz Attractor - Hydrological Interpretation')
#     ax_3d.legend()
#     if save_results:
#         plt.savefig(f"{output_dir}/lorenz_3d.png", dpi=300, bbox_inches='tight')
#     plt.show()
   
#     # Compile results
#     results = {
#         "time": t,
#         "observations": Q_obs,
#         "truth": Q_true,
#         "ensemble_forecasts": ensemble_forecasts,
#         "ensemble_median": ensemble_median,
#         "ensemble_statistics": {
#             "mean": ensemble_mean,
#             "std": ensemble_std,
#             "p05": ensemble_p05,
#             "p95": ensemble_p95
#         },
#         "validation_metrics": validation_metrics,
#         "parameter_estimates": param_stats,
#         "states_true": states_true,
#         "hyetograph": hyet,
#         "base_runoff": q_base,
#         "resampling_times": resampling_times,
#         "ess_history": pf.ess_history,
#         "config": config
#     }
   
#     # Save results
#     if save_results:
#         # Save numerical results
#         np.savez(f"{output_dir}/simulation_results.npz", **results)
       
#         # Save configuration
#         with open(f"{output_dir}/config.json", 'w') as f:
#             config_dict = {
#                 "CN": config.CN,
#                 "area_km2": config.area_km2,
#                 "lorenz_params": config.lorenz_params,
#                 "n_particles": config.n_particles,
#                 "validation_metrics": validation_metrics
#             }
#             json.dump(config_dict, f, indent=2)
       
#         logger.info(f"Results saved to {output_dir}/")
   
#     logger.info("Enhanced simulation completed successfully!")
#     return results

# # Example usage and testing
# if __name__ == "__main__":
#     # Example configuration for Naga City, Philippines
#     config = ModelParameters(
#         CN=78.0,
#         area_km2=84.48,
#         peak_mm_hr=50.0,  # Typical typhoon intensity
#         peak_time=12.0,
#         decay_rate=6.0,
#         n_particles=500,  # Reduced for faster testing
#         resampling_threshold=0.6
#     )
   
#     # Run enhanced simulation
#     results = run_enhanced_simulation(
#         config=config,
#         save_results=True,
#         output_dir="enhanced_results"
#     )
   
#     print("\n" + "="*60)
#     print("ENHANCED HYDROLOGICAL MODELING - SUMMARY")
#     print("="*60)
#     print(f"Final KGE Score: {results['validation_metrics']['KGE']:.4f}")
#     print(f"Nash-Sutcliffe Efficiency: {results['validation_metrics']['NSE']:.4f}")
#     print(f"CRPS: {results['validation_metrics']['CRPS']:.4f}")
#     print(f"90% Coverage: {results['validation_metrics']['Coverage_90']:.1%}")
#     print("="*60)