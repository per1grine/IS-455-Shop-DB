namespace StudentShopApp.ViewModels;

public sealed class ScoringRunResultViewModel
{
    public bool Succeeded { get; init; }
    public int ExitCode { get; init; }
    public string Command { get; init; } = string.Empty;
    public string StandardOutput { get; init; } = string.Empty;
    public string StandardError { get; init; } = string.Empty;
    public long DurationMilliseconds { get; init; }
}
