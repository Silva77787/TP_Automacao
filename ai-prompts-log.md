# AI Prompt Documentation Log

This document serves as a record of all prompts sent to the LLM (Large Language Model) for the development of this project. Each entry documents the input, context, and a summary of the output generated, providing transparency and traceability for AI-assisted work.

---

## Template for New Entries

Use this template for each new LLM interaction:

```
### AI-[ID]: [Feature/Task Name]

**Date**: [YYYY-MM-DD]

**Model**: [e.g., GPT-4, Claude 3, Perplexity AI]

**Task Description**: 
[Brief description of what was asked to the LLM]

**Input Prompt**:
> [The exact prompt text sent to the LLM in good English]

**Files/References Provided**:
- `[filename]` - [Brief description of what was sent]
- `[filename]` - [Brief description of what was sent]
- Reference to use cases: UC-01 through UC-09

**Output Summary**:
The LLM generated [brief description, e.g., a draft of db-implementation-guide.md that included SQL queries for each use case and implementation guidelines].

**Key Outputs Generated**:
- `[output-filename.md]` - [Description of what this file contains]

**Review & Modifications**:
- **Reviewed by**: [Developer name]
- **Date Reviewed**: [YYYY-MM-DD]
- **Status**: ✅ Approved / ⚠️ Needs revision / 🔄 In progress
- **Changes Made**: [Summary of any modifications or corrections applied by the reviewer]
- **Notes**: [Any additional notes or observations]

---
```

## Completed Interactions

### AI-001: Database Architecture Review & Implementation Guide

**Date**: 2025-11-08

**Model**: Perplexity AI

**Task Description**: 
Create a comprehensive technical guide for the development team on how to implement all planned features using the current PostgreSQL database architecture. The guide should include an overview of the database structure and detailed implementation instructions for each use case (UC-01 through UC-09), along with analysis of whether additional tables are needed for advanced recommendation features.

**Input Prompt**:
> "Create a database architecture review and implementation guide in Markdown format. The document should include:
> 1. A general description of the DB architecture
> 2. Go UC by UC (UC-01 through UC-09) explaining how each feature can be answered with our database structure
> 3. Include SQL query examples for each use case where applicable
> 4. Add a section on advanced system preferences and recommendations
> 5. Provide recommendations on whether a new table is needed for advanced preferences and how it can be implemented
> 
> The file should be written for team members to easily develop the features in the future by reading the guide. Structure it clearly with code examples and best practices."

**Files/References Provided**:
- PostgreSQL creation script with full table definitions, foreign keys, and constraints
- Use case descriptions (UC-01 through UC-09) with detailed steps and pre/post-conditions
- Database schema diagram showing relationships between tables

**Output Summary**:
The LLM generated a comprehensive `db-implementation-guide.md` file that included:
- Overview of 7 core tables and their relationships
- Detailed implementation instructions for all 9 use cases
- SQL query examples for searching by title, director, and genre
- Recommendation algorithm for personalized movie suggestions
- Analysis showing that explicit user preferences table is optional
- Guidance on when and how to add user preferences if needed in the future
- Performance considerations and next steps for the development team

**Key Outputs Generated**:
- `db-implementation-guide.md` - Comprehensive technical guide with SQL queries and implementation logic for all features

**Review & Modifications**:
- **Reviewed by**: Rafael Carneiro
- **Date Reviewed**: 2025-11-08
- **Status**: ✅ Approved
- **Changes Made**: 
  - Verified SQL syntax accuracy against PostgreSQL 12+ standards
  - Confirmed all use cases are properly addressed
  - Validated recommendation algorithm logic
  - Added notes about caching strategies and index optimization
- **Notes**: The guide effectively demonstrates that the current schema is sufficient for all features without requiring additional tables at this stage. The recommendation algorithm section provides clear guidance for implementation.

---

## Notes for Future Interactions

- Always provide the full database schema and use case descriptions when discussing database-related features
- Reference specific table names and column names from the actual schema to ensure accuracy
- Include constraints and data types when asking about implementation
- Request both basic and advanced implementation strategies when relevant
- Ask for SQL query examples whenever querying databases is involved
- Specify the target database system (PostgreSQL, MySQL, etc.) to ensure dialect-specific advice
- Include team member names for review and approval tracking

---

## Document Maintenance

- **Last Updated**: 2025-11-08
- **Created By**: Development Team
- **Version**: 1.0
- **Approved By**: [Project Lead Name]