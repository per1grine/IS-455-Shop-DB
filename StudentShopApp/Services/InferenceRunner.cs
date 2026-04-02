using System.Diagnostics;
using StudentShopApp.Models;
using StudentShopApp.ViewModels;

namespace StudentShopApp.Services;

public sealed class InferenceRunner
{
    private readonly AppSettings _settings;
    private readonly IWebHostEnvironment _environment;

    public InferenceRunner(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _settings = configuration.GetSection("AppSettings").Get<AppSettings>() ?? new AppSettings();
        _environment = environment;
    }

    public async Task<ScoringRunResultViewModel> RunAsync(CancellationToken cancellationToken = default)
    {
        var scriptPath = ResolvePath(_settings.InferenceScriptPath);
        var pythonCommand = _settings.PythonCommand;
        var stopwatch = Stopwatch.StartNew();

        if (!File.Exists(scriptPath))
        {
            return new ScoringRunResultViewModel
            {
                Succeeded = false,
                ExitCode = -1,
                Command = $"{pythonCommand} {scriptPath}",
                StandardError = $"Inference script was not found at {scriptPath}."
            };
        }

        var startInfo = new ProcessStartInfo
        {
            FileName = pythonCommand,
            Arguments = $"\"{scriptPath}\"",
            WorkingDirectory = Path.GetDirectoryName(scriptPath) ?? _environment.ContentRootPath,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false
        };

        using var process = new Process { StartInfo = startInfo };
        process.Start();

        var stdoutTask = process.StandardOutput.ReadToEndAsync(cancellationToken);
        var stderrTask = process.StandardError.ReadToEndAsync(cancellationToken);
        await process.WaitForExitAsync(cancellationToken);
        stopwatch.Stop();

        return new ScoringRunResultViewModel
        {
            Succeeded = process.ExitCode == 0,
            ExitCode = process.ExitCode,
            Command = $"{pythonCommand} {scriptPath}",
            StandardOutput = await stdoutTask,
            StandardError = await stderrTask,
            DurationMilliseconds = stopwatch.ElapsedMilliseconds
        };
    }

    private string ResolvePath(string configuredPath)
    {
        if (Path.IsPathRooted(configuredPath))
        {
            return configuredPath;
        }

        return Path.GetFullPath(Path.Combine(_environment.ContentRootPath, configuredPath));
    }
}
