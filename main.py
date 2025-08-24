from stream_project.simulation import run_enhanced_simulation
from stream_project.config import ModelParameters
from stream_project.flood_analysis import analyze_flood

if __name__ == "__main__":
    results = run_enhanced_simulation(ModelParameters(), save_results=True, output_dir="results")
    print("\n" + "="*60)
    print("ENHANCED HYDROLOGICAL MODELING - SUMMARY")
    print("="*60)
    vm = results["validation_metrics"]
    print(f"Final KGE Score: {vm['KGE']:.4f}")
    print(f"Nash-Sutcliffe Efficiency: {vm['NSE']:.4f}")
    print(f"CRPS: {vm['CRPS']:.4f}")
    print(f"90% Coverage: {vm['Coverage_90']:.1%}")
    print("="*60)
    
    analyze_flood(results, Q_FLOOD=350.0)