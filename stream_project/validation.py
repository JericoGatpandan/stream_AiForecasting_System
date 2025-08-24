import numpy as np
from typing import Dict

from .metrics import enhanced_kling_gupta_efficiency

from .logger import logger

class ModelValidation:
    """Comprehensive model validation framework."""
   
    def __init__(self, observations: np.ndarray, predictions: np.ndarray, time_grid: np.ndarray):
        """
        Initialize validation framework.
       
        Args:
            observations: Observed values
            predictions: Model predictions (ensemble)
            time_grid: Time grid
        """
        self.observations = observations
        self.predictions = predictions
        self.time_grid = time_grid
        self.metrics = {}
   
    def calculate_all_metrics(self) -> Dict[str, float]:
        """Calculate comprehensive validation metrics."""
        # Ensemble median
        pred_median = np.median(self.predictions, axis=0)
       
        # KGE and components
        kge, kge_components = enhanced_kling_gupta_efficiency(self.observations, pred_median)
        self.metrics.update({"KGE": kge, **kge_components})
       
        # Nash-Sutcliffe Efficiency
        nse = self._nash_sutcliffe_efficiency(self.observations, pred_median)
        self.metrics["NSE"] = nse
       
        # Percent Bias
        pbias = self._percent_bias(self.observations, pred_median)
        self.metrics["PBIAS"] = pbias
       
        # Root Mean Square Error
        rmse = self._rmse(self.observations, pred_median)
        self.metrics["RMSE"] = rmse
       
        # Mean Absolute Error
        mae = self._mae(self.observations, pred_median)
        self.metrics["MAE"] = mae
       
        # Probabilistic metrics
        crps = self._continuous_ranked_probability_score()
        self.metrics["CRPS"] = crps
       
        # Coverage metrics
        coverage_90 = self._prediction_interval_coverage(0.9)
        coverage_95 = self._prediction_interval_coverage(0.95)
        self.metrics["Coverage_90"] = coverage_90
        self.metrics["Coverage_95"] = coverage_95
       
        # Reliability metrics
        reliability = self._reliability_score()
        self.metrics["Reliability"] = reliability
       
        logger.info("Calculated comprehensive validation metrics")
        return self.metrics
   
    def _nash_sutcliffe_efficiency(self, obs: np.ndarray, sim: np.ndarray) -> float:
        """Calculate Nash-Sutcliffe Efficiency."""
        valid_mask = ~np.isnan(obs) & ~np.isnan(sim)
        if np.sum(valid_mask) < 2:
            return np.nan
       
        obs_valid = obs[valid_mask]
        sim_valid = sim[valid_mask]
       
        numerator = np.sum((obs_valid - sim_valid)**2)
        denominator = np.sum((obs_valid - np.mean(obs_valid))**2)
       
        return 1 - (numerator / (denominator + 1e-10))
   
    def _percent_bias(self, obs: np.ndarray, sim: np.ndarray) -> float:
        """Calculate Percent Bias."""
        valid_mask = ~np.isnan(obs) & ~np.isnan(sim)
        if np.sum(valid_mask) < 2:
            return np.nan
       
        obs_valid = obs[valid_mask]
        sim_valid = sim[valid_mask]
       
        return 100 * np.sum(sim_valid - obs_valid) / (np.sum(obs_valid) + 1e-10)
   
    def _rmse(self, obs: np.ndarray, sim: np.ndarray) -> float:
        """Calculate Root Mean Square Error."""
        valid_mask = ~np.isnan(obs) & ~np.isnan(sim)
        if np.sum(valid_mask) < 2:
            return np.nan
       
        obs_valid = obs[valid_mask]
        sim_valid = sim[valid_mask]
       
        return np.sqrt(np.mean((obs_valid - sim_valid)**2))
   
    def _mae(self, obs: np.ndarray, sim: np.ndarray) -> float:
        """Calculate Mean Absolute Error."""
        valid_mask = ~np.isnan(obs) & ~np.isnan(sim)
        if np.sum(valid_mask) < 2:
            return np.nan
       
        obs_valid = obs[valid_mask]
        sim_valid = sim[valid_mask]
       
        return np.mean(np.abs(obs_valid - sim_valid))
   
    def _continuous_ranked_probability_score(self) -> float:
        """Calculate Continuous Ranked Probability Score."""
        crps_values = []
       
        for i in range(len(self.observations)):
            if not np.isnan(self.observations[i]):
                ensemble = self.predictions[:, i]
                ensemble = ensemble[~np.isnan(ensemble)]
               
                if len(ensemble) > 0:
                    crps_val = self._crps_single(self.observations[i], ensemble)
                    crps_values.append(crps_val)
       
        return np.mean(crps_values) if crps_values else np.nan
   
    def _crps_single(self, observation: float, ensemble: np.ndarray) -> float:
        """Calculate CRPS for single observation."""
        ensemble_sorted = np.sort(ensemble)
        n = len(ensemble_sorted)
       
        # Empirical CDF
        p_values = np.arange(1, n+1) / n
       
        # Heaviside function
        heaviside = (ensemble_sorted <= observation).astype(float)
       
        # Integrate
        crps = np.trapezoid((p_values - heaviside)**2, ensemble_sorted)
       
        return crps
   
    def _prediction_interval_coverage(self, confidence_level: float) -> float:
        """Calculate prediction interval coverage."""
        alpha = 1 - confidence_level
        lower_quantile = alpha / 2
        upper_quantile = 1 - alpha / 2
       
        coverage_count = 0
        valid_count = 0
       
        for i in range(len(self.observations)):
            if not np.isnan(self.observations[i]):
                ensemble = self.predictions[:, i]
                ensemble = ensemble[~np.isnan(ensemble)]
               
                if len(ensemble) > 0:
                    lower_bound = np.percentile(ensemble, lower_quantile * 100)
                    upper_bound = np.percentile(ensemble, upper_quantile * 100)
                   
                    if lower_bound <= self.observations[i] <= upper_bound:
                        coverage_count += 1
                    valid_count += 1
       
        return coverage_count / valid_count if valid_count > 0 else np.nan
   
    def _reliability_score(self) -> float:
        """Calculate reliability score for probabilistic forecasts."""
        # Implement rank histogram-based reliability
        rank_counts = np.zeros(self.predictions.shape[0] + 1)
        total_count = 0
       
        for i in range(len(self.observations)):
            if not np.isnan(self.observations[i]):
                ensemble = self.predictions[:, i]
                ensemble = ensemble[~np.isnan(ensemble)]
               
                if len(ensemble) > 0:
                    # Find rank of observation in ensemble
                    combined = np.append(ensemble, self.observations[i])
                    sorted_indices = np.argsort(combined)
                    obs_rank = np.where(sorted_indices == len(ensemble))[0][0]
                   
                    rank_counts[obs_rank] += 1
                    total_count += 1
       
        if total_count > 0:
            expected_freq = total_count / len(rank_counts)
            chi_square = np.sum((rank_counts - expected_freq)**2 / expected_freq)
            return 1 - chi_square / (len(rank_counts) - 1)  # Normalized reliability
        else:
            return np.nan