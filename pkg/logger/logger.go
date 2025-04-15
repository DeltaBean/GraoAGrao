package logger

import (
	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	"fmt"
	"io"
	"os"
	"runtime"

	"github.com/sirupsen/logrus"
)

// Log is the exported logger instance.
var Log *logrus.Logger

func init() {
	Log = logrus.New()

	// Enable caller reporting
	Log.SetReportCaller(true)

	// Ensure the logs directory exists if you still want file logging.
	if err := os.MkdirAll("logs", 0755); err != nil {
		Log.Fatalf("Failed to create logs directory: %v", err)
	}

	// Open or create the local log file.
	logFile, err := os.OpenFile("logs/gophic.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		Log.Fatalf("Failed to open log file: %v", err)
	}

	// Set output to both stdout and the file.
	Log.SetOutput(io.MultiWriter(os.Stdout, logFile))

	// Set log format to JSON with caller information.
	Log.SetFormatter(&logrus.JSONFormatter{
		CallerPrettyfier: func(f *runtime.Frame) (string, string) {
			return "", fmt.Sprintf("%s:%d", f.File, f.Line)
		},
	})

	if os.Getenv("STAGE") == "DEV" {
		Log.SetLevel(logrus.DebugLevel)
	}
}
