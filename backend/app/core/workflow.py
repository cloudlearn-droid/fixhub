ALLOWED_TRANSITIONS = {
    "todo": ["in_progress"],
    "in_progress": ["done"],
    "done": ["in_progress"]
}


def is_valid_transition(current_status: str, new_status: str) -> bool:
    return new_status in ALLOWED_TRANSITIONS.get(current_status, [])
