import numpy as np
from typing import Callable
from typing import Dict, List
from .logger import logger
from .errors import NumericalError, ValidationError

from scipy.integrate import solve_ivp


def physically_motivated_lorenz_system(t: float,
                                     state: np.ndarray,
                                     hydrological_forcing: Callable,
                                     params: Dict[str, float]) -> List[float]:
    """
    Physically-motivated augmented Lorenz system for hydrological modeling.
   
    State Variables (Physical Interpretation):
    - x: Normalized discharge anomaly (dimensionless)
    - y: Energy dissipation rate (1/time)  
    - z: Channel storage index (dimensionless)
    - w: Groundwater-surface water exchange (mm/time)
   
    Mathematical System:
    dx/dt = σ(y - x) + γ*R(t) + α*noise
    dy/dt = x(ρ - z) - y + μ*storage_feedback
    dz/dt = xy - βz + κ*channel_dynamics  
    dw/dt = -κw + μy + groundwater_coupling
   
    Where R(t) is the normalized hydrological forcing.
   
    Args:
        t: Current time
        state: Current state vector [x, y, z, w]
        hydrological_forcing: Function returning normalized forcing
        params: System parameters
       
    Returns:
        State derivatives
    """
    x, y, z, w = state
   
    # Extract parameters with defaults
    sigma = params.get("sigma", 10.0)
    rho = params.get("rho", 28.0)
    beta = params.get("beta", 8.0/3.0)
    gamma = params.get("gamma", 0.015)
    kappa = params.get("kappa", 0.12)
    mu = params.get("mu", 0.008)
    alpha = params.get("alpha", 0.25)
   
    # Get current hydrological forcing
    try:
        R_t = float(hydrological_forcing(t))
    except:
        R_t = 0.0  # Fallback for extrapolation
   
    # Bounded forcing to prevent numerical instabilities
    R_t = np.clip(R_t, -5.0, 5.0)
   
    # Physical constraints and nonlinearities
    storage_feedback = np.tanh(0.5 * w)  # Bounded storage effect
    channel_dynamics = 0.1 * np.sin(0.2 * t)  # Periodic channel variations
    groundwater_coupling = 0.05 * (x**2 - w)  # Nonlinear coupling
   
    # System equations with physical interpretations
    dx_dt = sigma * (y - x) + gamma * R_t + alpha * storage_feedback
    dy_dt = x * (rho - z) - y + mu * storage_feedback  
    dz_dt = x * y - beta * z + kappa * channel_dynamics
    dw_dt = -kappa * w + mu * y + groundwater_coupling
   
    return [dx_dt, dy_dt, dz_dt, dw_dt]


def integrate_coupled_system(t_grid: np.ndarray,
                           initial_state: np.ndarray,
                           hydrological_forcing: np.ndarray,
                           lorenz_params: Dict[str, float],
                           method: str = "RK45") -> np.ndarray:
    """
    Robust integration of the coupled hydrological-chaos system.
   
    Args:
        t_grid: Time grid for integration
        initial_state: Initial conditions [x0, y0, z0, w0]
        hydrological_forcing: Normalized hydrological forcing series
        lorenz_params: Lorenz system parameters
        method: Integration method
       
    Returns:
        State evolution array (4 x n_times)
       
    Raises:
        NumericalError: If integration fails
    """
    if len(initial_state) != 4:
        raise ValidationError("Initial state must have 4 components")
   
    # Create interpolation function for forcing
    forcing_func = lambda t: np.interp(t, t_grid, hydrological_forcing)
   
    # Define RHS function
    def rhs(t, state):
        return physically_motivated_lorenz_system(t, state, forcing_func, lorenz_params)
   
    # Integration with error handling
    try:
        sol = solve_ivp(
            rhs,
            (t_grid[0], t_grid[-1]),
            initial_state,
            t_eval=t_grid,
            method=method,
            rtol=1e-8,
            atol=1e-11,
            max_step=np.min(np.diff(t_grid)) / 2,
            first_step=np.min(np.diff(t_grid)) / 10
        )
       
        if not sol.success:
            logger.error(f"Integration failed: {sol.message}")
            raise NumericalError(f"ODE integration failed: {sol.message}")
           
        # Check for numerical stability
        if np.any(~np.isfinite(sol.y)):
            raise NumericalError("Integration produced non-finite values")
           
        return sol.y
       
    except Exception as e:
        logger.error(f"Integration error: {str(e)}")
        raise NumericalError(f"Integration failed: {str(e)}")