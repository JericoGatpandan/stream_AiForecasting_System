def analyze_flood(results, Q_FLOOD=350.0):
    import numpy as np
    import matplotlib.pyplot as plt
    from itertools import groupby
    
    # === Inputs ===
    t = results["time"]                    # hours
    ens = results["ensemble_forecasts"]    # shape: (n_particles, T)
    Q_true = results.get("truth", None)    # optional, shape: (T,)
    Q_obs  = results.get("observations", None)

    Q_FLOOD = 350.0  # <-- set your flood threshold discharge (m^3/s), from rating curve or agency level
    P_ALARM = 0.6    # alarm when probability >= 60%
    MIN_CONSEC_HRS = 2

    # === Exceedance probability over time ===
    prob_exceed = np.mean(ens >= Q_FLOOD, axis=0)  # (T,)

    # === Determine observed/true flood timeseries (if you have it) ===
    has_truth = Q_true is not None
    has_obs   = Q_obs is not None
    y_event   = None
    if has_truth:
        y_event = (Q_true >= Q_FLOOD).astype(float)
    elif has_obs:
        y_event = (Q_obs >= Q_FLOOD).astype(float)

    # === Alarm detection ===
    above = prob_exceed >= P_ALARM
    # enforce minimum consecutive hours

    idx_alarm = []
    i = 0
    while i < len(above):
        if above[i]:
            j = i
            while j < len(above) and above[j]:
                j += 1
            if (j - i) >= MIN_CONSEC_HRS:
                idx_alarm.append(i)  # first time index of an alarm episode
            i = j
        else:
            i += 1

    predicted_flood = len(idx_alarm) > 0
    t_alarm = t[idx_alarm[0]] if predicted_flood else None

    # === If we have truth/obs, compute verification ===
    lead_time = None
    brier = None
    hit_miss = None

    if y_event is not None:
        # first true exceedance time
        if np.any(y_event == 1):
            t_event = t[np.argmax(y_event == 1)]
            if predicted_flood:
                lead_time = float(t_event - t_alarm)
            # Event-level hit/miss/false alarm
            true_event = np.any(y_event == 1)
            hit_miss = (
                "HIT" if (true_event and predicted_flood) else
                "MISS" if (true_event and not predicted_flood) else
                "FALSE ALARM" if (not true_event and predicted_flood) else
                "CORRECT REJECTION"
            )
        # Brier score for full time series
        brier = float(np.mean((prob_exceed - y_event)**2))

    # === Print a compact summary ===
    print("\n--- Flood Prediction Check ---")
    print(f"Q_FLOOD = {Q_FLOOD:.1f} m^3/s")
    print(f"Predicted Flood? {predicted_flood}")
    print(f"First Alarm Time: {t_alarm} h" if predicted_flood else "No alarm issued")
    if lead_time is not None:
        print(f"Lead Time (alarm minus first true exceedance): {lead_time:.1f} h")
    if hit_miss is not None:
        print(f"Event Verification: {hit_miss}")
    if brier is not None:
        print(f"Brier Score: {brier:.3f}")
    print(f"Max Exceedance Probability: {prob_exceed.max():.2f}")

    # === Simple visualization ===
    fig, ax1 = plt.subplots(figsize=(10,5))
    ax1.plot(t, np.nanmedian(ens, axis=0), label="Ensemble Median Q", linewidth=2)
    ax1.fill_between(t, np.nanpercentile(ens,5,axis=0), np.nanpercentile(ens,95,axis=0), alpha=0.3, label="90% CI")
    if has_truth:
        ax1.plot(t, Q_true, linestyle="--", label="True Q")
    if has_obs:
        ax1.plot(t, Q_obs, marker="o", markersize=3, linewidth=1, label="Obs Q", alpha=0.7)
    ax1.axhline(Q_FLOOD, linestyle="--", color="k", label="Flood Threshold")
    ax1.set_xlabel("Time (h)")
    ax1.set_ylabel("Discharge (m³/s)")
    ax1.legend(loc="upper left")

    ax2 = ax1.twinx()
    ax2.plot(t, prob_exceed, label="P(Q ≥ Q_flood)", linewidth=2)
    ax2.set_ylabel("Exceedance Probability")
    ax2.set_ylim(0, 1)
    if predicted_flood:
        ax2.axvline(t_alarm, linestyle=":", label="First Alarm", alpha=0.7)
    ax2.legend(loc="upper right")

    plt.title("Flood Exceedance Probability & Hydrograph")
    plt.tight_layout()
    plt.show()