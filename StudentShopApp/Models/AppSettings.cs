namespace StudentShopApp.Models;

public sealed class AppSettings
{
    public string DatabasePath { get; set; } = "../shop.db";
    public string PythonCommand { get; set; } = "python3";
    public string InferenceScriptPath { get; set; } = "../jobs/run_inference.py";
}
