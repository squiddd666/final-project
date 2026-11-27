# EduTrack ERD

A student or teacher account links to its corresponding profile; administrator accounts link to neither.

```mermaid
erDiagram
    TEACHERS ||--o{ COURSES : teaches
    STUDENTS ||--o{ ENROLLMENTS : enrolls
    COURSES ||--o{ ENROLLMENTS : includes
    ENROLLMENTS ||--o{ ATTENDANCES : tracks
    ENROLLMENTS ||--o{ GRADES : receives
    TEACHERS ||--o{ GRADES : records
    STUDENTS o|--o| ACCOUNTS : links
    TEACHERS o|--o| ACCOUNTS : links
```
