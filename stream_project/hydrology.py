import numpy as np
from typing import Union
from .logger import logger
from .errors import ValidationError, NumericalError

def scs_runoff_with_uncertainty(P_mm: Union[float, np.ndarray],
                               CN: Union[float, np.ndarray],
                               lambda_ia: float = 0.2,
                               antecedent_moisture: str = "AMC_II") -> Union[float, np.ndarray]:
    """
    Enhanced SCS runoff calculation with antecedent moisture conditions.
   
    Mathematical formulation:
    S = (25400/CN) - 254  [mm]
    Ia = λ * S
    Q = (P - Ia)²/(P - Ia + S)  for P > Ia, else Q = 0
   
    Args:
        P_mm: Precipitation depth(s) in mm
        CN: Curve number(s)
        lambda_ia: Initial abstraction ratio
        antecedent_moisture: Antecedent Moisture Condition
       
    Returns:
        Runoff depth(s) in mm
       
    Raises:
        ValidationError: If parameters are invalid
    """
    # Validate inputs
    P_mm = np.atleast_1d(P_mm)
    CN = np.atleast_1d(CN)
   
    if np.any(P_mm < 0):
        raise ValidationError("Precipitation must be non-negative")
    if np.any((CN < 30) | (CN > 100)):
        raise ValidationError("CN must be between 30 and 100")
    if not (0 < lambda_ia < 1):
        raise ValidationError("Initial abstraction ratio must be in (0, 1)")
   
    # Adjust CN for antecedent moisture conditions
    CN_adjusted = CN.copy()
    if antecedent_moisture == "AMC_I":  # Dry conditions
        CN_adjusted = CN / (2.334 - 0.01334 * CN)
    elif antecedent_moisture == "AMC_III":  # Wet conditions  
        CN_adjusted = CN / (0.427 + 0.00573 * CN)
   
    # SCS calculations with vectorization
    S = 25400.0 / CN_adjusted - 254.0  # Maximum potential retention
    Ia = lambda_ia * S  # Initial abstraction
   
    # Runoff calculation
    excess = np.maximum(P_mm - Ia, 0)
    Q = np.where(excess > 0, excess**2 / (excess + S), 0)
   
    return Q.item() if Q.size == 1 else Q


def triangular_unit_hydrograph_enhanced(t_grid: np.ndarray,
                                      t_peak: float = 4.0,
                                      t_base: float = 18.0,
                                      validate_volume: bool = True) -> np.ndarray:
    """
    Enhanced triangular unit hydrograph with volume validation.
   
    Mathematical formulation:
    UH(t) = {
        t/t_p                    for 0 ≤ t ≤ t_p
        (t_b - t)/(t_b - t_p)    for t_p < t ≤ t_b  
        0                        otherwise
    }
   
    With constraint: ∫UH(t)dt = 1
   
    Args:
        t_grid: Time grid
        t_peak: Time to peak
        t_base: Base time
        validate_volume: Whether to validate unit volume
       
    Returns:
        Unit hydrograph ordinates
       
    Raises:
        ValidationError: If parameters violate physical constraints
    """
    if t_peak <= 0 or t_base <= t_peak:
        raise ValidationError(f"Invalid UH timing: t_peak={t_peak}, t_base={t_base}")
   
    dt = np.mean(np.diff(t_grid)) if len(t_grid) > 1 else 1.0
    UH = np.zeros_like(t_grid)
   
    # Vectorized calculation
    t_rel = t_grid - t_grid[0]  # Relative time
   
    # Rising limb
    rising_mask = (t_rel >= 0) & (t_rel <= t_peak)
    UH[rising_mask] = t_rel[rising_mask] / t_peak
   
    # Falling limb
    falling_mask = (t_rel > t_peak) & (t_rel <= t_base)
    UH[falling_mask] = (t_base - t_rel[falling_mask]) / (t_base - t_peak)
   
    # Volume normalization
    volume = np.trapezoid(UH, dx=dt)
    if volume > 1e-10:
        UH = UH / volume
    else:
        raise NumericalError("Unit hydrograph has zero volume")
   
    # Validation
    if validate_volume:
        final_volume = np.trapezoid(UH, dx=dt)
        if abs(final_volume - 1.0) > 1e-3:
            logger.warning(f"UH volume validation failed: {final_volume:.6f}")
   
    logger.info(f"Generated triangular UH: t_peak={t_peak}, t_base={t_base}, volume={np.trapezoid(UH, dx=dt):.6f}")
   
    return UH