# Narrated demo run sheet (6-8 minutes)

Use XAMPP and synthetic records. Do not show your .env, password, or full token in the recording.

| Time | What to show |
| --- | --- |
| 0:00-1:00 | Start the XAMPP database, then run npm run start:dev and show NestJS startup. |
| 1:00-2:00 | In Postman, run Login as the demo admin and explain that the returned access token is saved for protected requests. |
| 2:00-4:00 | Run Create students, Read students, Update students, and Delete students in order. Show the response codes and note the generated student ID. |
| 4:00-5:30 | Open src/main.ts. Trace the create request through StudentsController, ApiService.save, the TypeORM repository, and the students table; explain the 201 response. |
| 5:30-6:00 | Run Missing token. Explain why it returns 401 instead of exposing data. |
| 6:00-7:00 | In phpMyAdmin, query the students table for the demo ID and confirm the deleted row is absent. |

Use your own narration. Upload the recording as a shareable link and provide that link for the PDF cover.
