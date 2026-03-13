#!/bin/bash

# Function to get the current git branch
get_git_branch() {
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        echo "git:$(git rev-parse --abbrev-ref HEAD)"
    fi
}

# Function to get the current Node.js version
get_node_version() {
    if command -v node &>/dev/null; then
        echo "node:$(node -v)"
    fi
}

git_info=$(get_git_branch)
node_info=$(get_node_version)

# Combine the info, separated by a pipe if both exist
if [[ -n "$git_info" && -n "$node_info" ]]; then
    echo "$git_info | $node_info"
elif [[ -n "$git_info" ]]; then
    echo "$git_info"
elif [[ -n "$node_info" ]]; then
    echo "$node_info"
fi
