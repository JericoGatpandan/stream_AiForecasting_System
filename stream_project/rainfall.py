import numpy as np
from .logger import logger
from .errors import ValidationError, NumericalError

def generate_physically_motivated_hyetograph(t: np.ndarray,
                                           peak_mm_hr: float = 45.0,
                                           peak_time: float = 10.0,
                                           decay_rate: float = 8.0,
                                           storm_type: str = "exponential") -> np.ndarray:
    """
    Generate synthetic hyetograph with multiple storm patterns.
   
    Mathematical formulation:
    - Exponential: P(t) = P_max * exp(-|t - t_peak|/λ)
    - Gamma: P(t) = P_max * (t/t_peak)^α * exp(-α*t/t_peak)
    - Double exponential: Combined rising and falling limbs
   
    Args:
        t: Time array
        peak_mm_hr: Maximum rainfall intensity
        peak_time: Time of peak intensity
        decay_rate: Storm decay parameter
        storm_type: Type of storm pattern
       
    Returns:
        Rainfall intensity array
       
    Raises:
        ValidationError: If parameters are invalid
    """
    if np.any(t < 0):
        raise ValidationError("Time values must be non-negative")
    if peak_mm_hr <= 0:
        raise ValidationError("Peak rainfall must be positive")
   
    logger.info(f"Generating {storm_type} hyetograph with peak {peak_mm_hr} mm/hr")
   
    if storm_type == "exponential":
        return peak_mm_hr * np.exp(-np.abs(t - peak_time) / decay_rate)
    elif storm_type == "gamma":
        alpha = 2.0  # Shape parameter
        normalized_t = np.maximum(t / peak_time, 1e-10)
        return peak_mm_hr * (normalized_t**alpha) * np.exp(-alpha * normalized_t)
    elif storm_type == "double_exponential":
        # Rising limb
        rise_rate = decay_rate / 2
        fall_rate = decay_rate
        rising = np.where(t <= peak_time,
                         peak_mm_hr * (1 - np.exp(-(t - 0) / rise_rate)),
                         0)
        falling = np.where(t > peak_time,
                          peak_mm_hr * np.exp(-(t - peak_time) / fall_rate),
                          0)
        return rising + falling
    else:
        raise ValidationError(f"Unknown storm type: {storm_type}")