# Preloaded with `ruby -r` before the learner's program: unbuffered output, so what a program
# printed before it crashed or was killed is not lost in a pipe buffer. Does not alter $0.
$stdout.sync = true
$stderr.sync = true
