#!/bin/bash
SESSION="my_agent_team"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 1. Get a list of all pane IDs in the target session
PANE_IDS=$(tmux list-panes -s -t "$SESSION" -F "#{pane_id}")
PAUSED_PANES=""
RESET_TIME=""
AGENT_TZ=""

# 2. Scan ALL panes and build a list of the paused ones
for PANE in $PANE_IDS; do
    RAW_OUTPUT=$(tmux capture-pane -p -t "$PANE" | tail -n 15 | grep "out of extra usage" | tail -n 1)
    
    if [ -n "$RAW_OUTPUT" ]; then
        log "Usage limit detected in pane $PANE"
        PAUSED_PANES="$PAUSED_PANES $PANE"

        # Grab the reset time from the first blocked pane we find (they will all be the same)
        if [ -z "$RESET_TIME" ]; then
            RESET_TIME=$(echo "$RAW_OUTPUT" | grep -oE '[0-9]+(:[0-9]+)?[apm]+')
            AGENT_TZ=$(echo "$RAW_OUTPUT" | grep -oE '\([^)]+\)' | tr -d '()')
        fi
    else
        log "Pane $PANE: no usage limit detected"
    fi
done

# If no panes are paused, exit cleanly so the sidecar loop can check again later
if [ -z "$PAUSED_PANES" ]; then
    exit 0
fi

# 3. Calculate the sleep delta ONCE
if [[ "$RESET_TIME" == *":"* ]]; then
    DATE_FMT="%I:%M%p"
else
    DATE_FMT="%I%p"
fi

TARGET_EPOCH=$(TZ="$AGENT_TZ" date -j -f "$DATE_FMT" "$RESET_TIME" +%s)
NOW_EPOCH=$(TZ="$AGENT_TZ" date +%s)

# Fix midnight rollover
if [ $(( TARGET_EPOCH - NOW_EPOCH )) -lt -43200 ]; then
    TARGET_EPOCH=$(( TARGET_EPOCH + 86400 ))
fi

RAW_DIFF=$(( TARGET_EPOCH - NOW_EPOCH ))

# 4. Execute the unified sleep
if [ "$RAW_DIFF" -gt 0 ]; then
    WAIT_SEC=$(( RAW_DIFF + 120 ))
    log "Sleeping for $WAIT_SEC seconds until $RESET_TIME $AGENT_TZ..."
    sleep "$WAIT_SEC"
    log "Wait complete. Initiating swarm wake-up sequence."
else
    log "Reset time ($RESET_TIME) has already passed. Resuming immediately."
fi

# 5. Rapidly loop through the saved list and wake ALL paused panes
for PANE in $PAUSED_PANES; do
    log "Injecting 'continue' keystrokes into pane $PANE..."
    tmux send-keys -t "$PANE" "continue"
    sleep 0.1
    tmux send-keys -t "$PANE" Enter
done

log "All blocked agents have been resumed."