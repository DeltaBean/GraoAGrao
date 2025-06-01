package logger

import (
	"encoding/json"
	"strings"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	"fmt"
	"io"
	"os"
	"runtime"

	"github.com/sirupsen/logrus"
)

type Logger struct {
	*logrus.Logger
}

// LogSQL prints a single-line SQL and nicely formatted args.
//   - Collapses all whitespace in `query` to single spaces.
//   - If you pass exactly one slice/array as the only arg, it prints “[x y z]”
//     rather than “[ [x y z] ]”.  Otherwise it prints the full args slice.
func (l *Logger) DebugSQL(query string, args ...interface{}) {
	oneLine := strings.Join(strings.Fields(query), " ")
	var argsStr string
	if len(args) == 1 {
		argsStr = fmt.Sprintf("%v", args[0])
	} else {
		argsStr = fmt.Sprintf("%v", args)
	}
	l.WithField("data", fmt.Sprintf("SQL ▶ %s -- args: %s", oneLine, argsStr)).Debug("sql dump")
}

// DebugAsJSON will log the value `v` under a `data` field, embedding
// the JSON unescaped in the output.
// It uses json.RawMessage so the JSONFormatter doesn’t re-quote it.
func (l *Logger) DebugAsJSON(v interface{}) {
	b, err := json.Marshal(v)
	if err != nil {
		l.Errorf("failed to marshal object to JSON: %v", err)
		return
	}
	// Wrap in RawMessage so Logrus will insert it verbatim
	var raw json.RawMessage = b
	l.WithField("data", raw).Debug("object dump")
}

// Log is the exported logger instance.
var Log *Logger

func init() {
	base := logrus.New()

	Log = &Logger{base}

	// Enable caller reporting
	Log.SetReportCaller(true)

	// Ensure the logs directory exists if you still want file logging.
	if err := os.MkdirAll("logs", 0755); err != nil {
		Log.Fatalf("Failed to create logs directory: %v", err)
	}

	// Open or create the local log file.
	logFile, err := os.OpenFile("logs/grao.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
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
