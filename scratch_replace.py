import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements.items():
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replace_in_file('src/features/delay-cases/types/delay-cases.ts', {
    '"CLOSED_OBJECTIVE"': '"CLOSED_EXCUSED"',
    '"CLOSED_SUBJECTIVE"': '"CLOSED_REJECTED"',
    'LecturerOutcome = "OBJECTIVE" | "SUBJECTIVE"': 'LecturerOutcome = "EXCUSED" | "REJECTED"'
})

replace_in_file('src/features/delay-cases/lib/delay-case-constants.ts', {
    'CLOSED_OBJECTIVE:': 'CLOSED_EXCUSED:',
    'CLOSED_SUBJECTIVE:': 'CLOSED_REJECTED:',
    'Khách quan — Không tính trễ': 'Châm chước — Không tính trễ',
    'Chủ quan — Tính trễ': 'Từ chối — Tính trễ'
})

replace_in_file('src/features/delay-cases/components/project-delay-cases-view.tsx', {
    'CLOSED_OBJECTIVE': 'CLOSED_EXCUSED',
    'CLOSED_SUBJECTIVE': 'CLOSED_REJECTED'
})

replace_in_file('src/features/delay-cases/components/lecturer-delay-queue-view.tsx', {
    'case "OBJECTIVE":': 'case "EXCUSED":',
    'status: "CLOSED_OBJECTIVE"': 'status: "CLOSED_EXCUSED"',
    'case "SUBJECTIVE":': 'case "REJECTED":',
    'status: "CLOSED_SUBJECTIVE"': 'status: "CLOSED_REJECTED"',
    '"CLOSED_OBJECTIVE", "CLOSED_SUBJECTIVE"': '"CLOSED_EXCUSED", "CLOSED_REJECTED"',
    'value: "OBJECTIVE", label: "Đã duyệt - Khách quan"': 'value: "EXCUSED", label: "Đã duyệt - Châm chước"',
    'value: "SUBJECTIVE", label: "Đã duyệt - Chủ quan"': 'value: "REJECTED", label: "Đã duyệt - Từ chối"'
})

replace_in_file('src/features/delay-cases/components/delay-case-lecturer-review-form.tsx', {
    '"OBJECTIVE"': '"EXCUSED"',
    '"SUBJECTIVE"': '"REJECTED"',
    'Khách quan': 'Châm chước',
    'Chủ quan': 'Từ chối'
})

replace_in_file('src/features/delay-cases/components/delay-case-card.tsx', {
    'delayCase.lecturerOutcome === "OBJECTIVE"': 'delayCase.lecturerOutcome === "EXCUSED"',
    '"Khách quan" : "Chủ quan"': '"Châm chước" : "Từ chối"'
})
