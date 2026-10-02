import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements.items():
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replace_in_file('src/features/delay-cases/types/delay-cases.ts', {
    '"AWAITING_LEADER"': '"PENDING_LEADER_REVIEW"',
    '"AWAITING_LECTURER"': '"PENDING_LECTURER_REVIEW"'
})

replace_in_file('src/features/delay-cases/lib/delay-case-constants.ts', {
    'AWAITING_LEADER:': 'PENDING_LEADER_REVIEW:',
    'AWAITING_LECTURER:': 'PENDING_LECTURER_REVIEW:'
})

replace_in_file('src/features/delay-cases/components/lecturer-delay-queue-view.tsx', {
    '"AWAITING_LECTURER"': '"PENDING_LECTURER_REVIEW"'
})

replace_in_file('src/features/delay-cases/components/project-delay-cases-view.tsx', {
    '"AWAITING_LEADER"': '"PENDING_LEADER_REVIEW"'
})
