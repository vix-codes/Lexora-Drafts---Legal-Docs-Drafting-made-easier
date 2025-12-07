# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Firestore Database Schema

Here is a diagram representing the structure of the Firestore database used in this application.

```mermaid
erDiagram
    users {
        string uid "Primary Key"
        string email
        string username
        timestamp createdAt
    }

    activities {
        string activityId "Primary Key"
        string action
        string subject
        timestamp timestamp
    }

    approvedDrafts {
        string draftId "Primary Key"
        string originalRequestId
        string documentType
        string approvedContent
        timestamp approvedAt
    }

    lawyers {
        string lawyerId "Primary Key (same as user uid)"
        string name
        string email
        boolean isVerified
        array specializations
        number experience
        object location
    }

    verificationRequests {
        string requestId "Primary Key"
        string userId "Foreign Key"
        string documentType
        string status
        string type
        array lawyerComments
        timestamp createdAt
    }

    users ||--o{ activities : "has sub-collection"
    users ||--o{ approvedDrafts : "has sub-collection"
    users ||--o{ verificationRequests : "creates"
    lawyers ||--|| users : "is a"
    verificationRequests ||--o{ approvedDrafts : "results in"

```
