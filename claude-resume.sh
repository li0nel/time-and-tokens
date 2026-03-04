#!/bin/bash
PANE="my_agent"

# 1. Grab the raw limit string from tmux
RAW_OUTPUT=$(tmux capture-pane -p -t "$PANE" | tail -n 15 | grep "out of extra usage" | tail -n 1)

if [ -z "$RAW_OUTPUT" ]; then
    echo "No usage limit found in pane $PANE."
    exit 1
fi

# 2. Extract the time and the timezone dynamically
# Pulls '10am' or '10:30am'
RESET_TIME=$(echo "$RAW_OUTPUT" | grep -oE '[0-9]+(:[0-9]+)?[apm]+')
# Pulls 'Australia/Brisbane' from between the parentheses
AGENT_TZ=$(echo "$RAW_OUTPUT" | grep -oE '\([^)]+\)' | tr -d '()')

# Determine the correct date format
if [[ "$RESET_TIME" == *":"* ]]; then
    DATE_FMT="%I:%M%p"
else
    DATE_FMT="%I%p"
fi

# 3. Calculate the raw difference
TARGET_EPOCH=$(TZ="$AGENT_TZ" date -j -f "$DATE_FMT" "$RESET_TIME" +%s)
NOW_EPOCH=$(TZ="$AGENT_TZ" date +%s)

# Fix midnight rollover: if target appears to be >12 hours in the past, it's actually tomorrow
if [ $(( TARGET_EPOCH - NOW_EPOCH )) -lt -43200 ]; then
    TARGET_EPOCH=$(( TARGET_EPOCH + 86400 ))
fi

RAW_DIFF=$(( TARGET_EPOCH - NOW_EPOCH ))

# 4. Apply safety buffer ONLY if the reset is in the future
if [ "$RAW_DIFF" -gt 0 ]; then
    WAIT_SEC=$(( RAW_DIFF + 120 )) # 2-minute safety buffer
    echo "Waiting $WAIT_SEC seconds (includes buffer) until $RESET_TIME $AGENT_TZ..."
    sleep "$WAIT_SEC"
else
    echo "Reset time ($RESET_TIME) has already passed. Resuming immediately."
fi

# 5. Inject the continue command (split to bypass Node.js input rendering lag)
tmux send-keys -t "$PANE" "continue"
sleep 0.1
tmux send-keys -t "$PANE" Enter