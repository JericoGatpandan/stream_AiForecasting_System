import numpy as np
from .logger import logger
from typing import Optional, Tuple, Dict
from .errors import ValidationError

def enhanced_kling_gupta_efficiency(obs: np.ndarray,
                                  sim: np.ndarray,
                                  weights: Optional[np.ndarray] = None) -> Tuple[float, Dict[str, float]]:
    """
    Enhanced KGE calculation with optional weighting and robust statistics.
   
    Mathematical formulation:
    KGE = 1 - √[(r-1)² + (α-1)² + (β-1)²]
   
    Where:
    - r: Pearson correlation coefficient
    - α: Ratio of standard deviations (variability)
    - β: Ratio of means (bias)
   
    Args:
        obs: Observed values
        sim: Simulated values  
        weights: Optional weights for robust statistics
       
    Returns:
        Tuple of (KGE value, components dictionary)
       
    Raises:
        ValidationError: If inputs are invalid
    """
    obs = np.asarray(obs, dtype=float)
    sim = np.asarray(sim, dtype=float)
   
    if obs.size != sim.size:
        raise ValidationError("obs and sim must have same length")
   
    # Handle missing values
    valid_mask = ~np.isnan(obs) & ~np.isnan(sim) & np.isfinite(obs) & np.isfinite(sim)
    if np.sum(valid_mask) < 3:
        logger.warning("Insufficient valid data points for KGE calculation")
        return np.nan, {"r": np.nan, "alpha": np.nan, "beta": np.nan, "n_valid": 0}
   
    obs_valid = obs[valid_mask]
    sim_valid = sim[valid_mask]
   
    if weights is not None:
        weights = weights[valid_mask]
        weights = weights / np.sum(weights)  # Normalize weights
   
    # Robust statistics
    if weights is not None:
        mu_o = np.average(obs_valid, weights=weights)
        mu_s = np.average(sim_valid, weights=weights)
        var_o = np.average((obs_valid - mu_o)**2, weights=weights)
        var_s = np.average((sim_valid - mu_s)**2, weights=weights)
        cov = np.average((obs_valid - mu_o) * (sim_valid - mu_s), weights=weights)
    else:
        mu_o = np.mean(obs_valid)
        mu_s = np.mean(sim_valid)
        var_o = np.var(obs_valid, ddof=1)
        var_s = np.var(sim_valid, ddof=1)
        cov = np.cov(obs_valid, sim_valid, ddof=1)[0, 1]
   
    # Robust standard deviations
    sigma_o = np.sqrt(var_o)
    sigma_s = np.sqrt(var_s)
   
    # Handle edge cases
    if sigma_o < 1e-10 or sigma_s < 1e-10:
        logger.warning("Near-zero variance detected in KGE calculation")
        r = 0.0
        alpha = 1.0 if sigma_o < 1e-10 else sigma_s / 1e-10
    else:
        r = cov / (sigma_o * sigma_s)
        alpha = sigma_s / sigma_o
   
    # Bias ratio with protection against division by zero
    beta = mu_s / (mu_o + 1e-10 * np.sign(mu_o) if abs(mu_o) > 1e-10 else 1e-10)
   
    # KGE calculation
    KGE = 1.0 - np.sqrt((r - 1.0)**2 + (alpha - 1.0)**2 + (beta - 1.0)**2)
   
    return KGE, {
        "r": r,
        "alpha": alpha,
        "beta": beta,
        "n_valid": np.sum(valid_mask),
        "mu_obs": mu_o,
        "mu_sim": mu_s,
        "sigma_obs": sigma_o,
        "sigma_sim": sigma_s
    }