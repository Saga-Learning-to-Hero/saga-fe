import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements.items():
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replacements = {
    '"PENDING_LEADER_REVIEW"': '"AWAITING_LEADER"',
    '"PENDING_LECTURER_REVIEW"': '"AWAITING_LECTURER"',
    '"CLOSED_EXCUSED"': '"CLOSED_OBJECTIVE"',
    '"CLOSED_REJECTED"': '"CLOSED_SUBJECTIVE"',
    'PENDING_LEADER_REVIEW:': 'AWAITING_LEADER:',
    'PENDING_LECTURER_REVIEW:': 'AWAITING_LECTURER:',
    'CLOSED_EXCUSED:': 'CLOSED_OBJECTIVE:',
    'CLOSED_REJECTED:': 'CLOSED_SUBJECTIVE:',
    'type LecturerOutcome = "EXCUSED" | "REJECTED"': 'type LecturerOutcome = "OBJECTIVE" | "SUBJECTIVE"',
    'lecturerOutcome === "EXCUSED"': 'lecturerOutcome === "OBJECTIVE"',
    'lecturerOutcome === "REJECTED"': 'lecturerOutcome === "SUBJECTIVE"',
    'outcome: "EXCUSED" | "REJECTED"': 'outcome: "OBJECTIVE" | "SUBJECTIVE"'
}

replace_in_file('src/features/delay-cases/types/delay-cases.ts', replacements)
replace_in_file('src/features/delay-cases/lib/delay-case-constants.ts', replacements)
replace_in_file('src/features/delay-cases/components/lecturer-delay-queue-view.tsx', replacements)
replace_in_file('src/features/delay-cases/components/project-delay-cases-view.tsx', replacements)
replace_in_file('src/features/delay-cases/components/delay-case-card.tsx', replacements)
replace_in_file('src/features/delay-cases/components/delay-case-lecturer-review-form.tsx', replacements)
