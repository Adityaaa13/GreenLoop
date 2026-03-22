---
title: "GreenLoop: An AI-Powered Open-Source Platform for Citizen-Driven Garbage Dump Detection and Cleanup Management"
tags:
  - urban waste management
  - illegal dumping detection
  - civic technology
  - citizen reporting
  - computer vision
  - multimodal AI
  - image classification
  - human-in-the-loop
  - smart cities
  - geospatial verification
  - microservices
  - open government
  - environmental monitoring
  - sustainable development
authors:
  - name: Neelesh Gadi
    affiliation: 1
    corresponding: true
  - name: Aditya Kumar
    affiliation: 1
  - name: Raunak Singh
    affiliation: 1
  - name: Kamal Singh
    affiliation: 1
affiliations:
  - name: Lovely Professional University, Punjab, India
    index: 1
date: 22 March 2026
bibliography: paper.bib
---

# Summary

GreenLoop is an open-source, full-stack web application that addresses the challenge of illegal garbage dump management in urban environments. The platform enables citizens to submit geotagged photographic reports of waste sites through a React-based frontend. Each submitted image is automatically routed to a dedicated Python AI microservice, which employs Google Gemini 2.5 Flash via the LangChain framework [@langchain2024] to classify the image as a valid or invalid garbage dump. A confidence-based decision engine then determines whether the submission is auto-accepted, queued for human review, or rejected. Validated reports are persisted in MongoDB Atlas and made available to municipal team leads, who assign cleanup tasks to field workers. Workers submit geotagged photographic proof of cleanup, which undergoes a second round of AI verification before the task is marked complete. The system implements a four-role access model (citizen, worker, team lead, administrator) enforced via JSON Web Token (JWT) authentication, and maintains a comprehensive audit log of all AI decisions for transparency and accountability.

# Statement of Need

Rapid urbanization has intensified the problem of illegal dumping and inadequate waste collection in cities across the developing world. Municipal authorities frequently lack the digital infrastructure to efficiently collect, validate, and act upon citizen-reported waste incidents, resulting in delayed cleanups, inconsistent data quality, and limited accountability [@un_sdg11]. Manual report verification is labor-intensive and prone to error, while existing commercial platforms are often proprietary, expensive, and inaccessible to under-resourced municipalities or academic researchers [@vietnam_ai_waste].

Several civic reporting platforms exist, such as SeeClickFix [@seeclickfix], which allow citizens to flag neighborhood issues. However, these platforms rely entirely on manual review by city staff and do not incorporate automated image validation, leaving them vulnerable to false or irrelevant submissions that burden municipal workflows. Research into AI-assisted urban monitoring has demonstrated the potential of computer vision for detecting waste and urban blight [@citydetect2024], but production-ready, open-source implementations that integrate the full reporting-to-cleanup workflow remain scarce.

GreenLoop addresses this gap by providing a fully open-source solution that automates the most labor-intensive steps in the reporting pipeline through AI image validation, while preserving human oversight for ambiguous cases via a human-in-the-loop review queue [@hitl2024]. By decoupling the AI validation layer into an independent Python microservice [@microservices2023], the platform allows researchers and developers to swap or extend the underlying model without modifying the core application. This modularity makes GreenLoop suitable not only as a deployable civic tool but also as a research testbed for studying AI-assisted urban governance, confidence-based automated decision-making, and geospatial verification in public infrastructure contexts.

The software directly supports the objectives of United Nations Sustainable Development Goal 11 (SDG 11) — Sustainable Cities and Communities — by providing open digital infrastructure that empowers citizens and local governments to collaboratively maintain cleaner, safer urban environments [@un_sdg11].

# Architecture Overview

GreenLoop follows a three-tier microservice architecture:

1. **React Frontend** — A single-page application providing role-specific dashboards for citizens, workers, team leads, and administrators. Communicates with the Node.js backend via RESTful HTTP.

2. **Node.js/Express Backend** — Handles authentication, business logic, MongoDB persistence, Cloudinary image storage, and orchestrates calls to the Python AI microservice.

3. **Python AI Microservice** — A standalone FastAPI service that performs all image classification tasks. Receives image URLs from the Node backend, fetches and encodes images, invokes the Gemini model via LangChain, and returns structured validation results.

This separation of concerns ensures that the AI component can be independently scaled, replaced, or extended without affecting the core application [@microservices2023].

# Key Technical Modules

## 1. AI Image Validation Microservice

The AI validation layer is implemented as a standalone Python FastAPI service. When a citizen submits a report image or a worker submits cleanup proof, the Node backend forwards the Cloudinary image URL to the Python service via HTTP POST. The service fetches the image, encodes it in base64, and invokes Google Gemini 2.5 Flash through LangChain's `ChatGoogleGenerativeAI` interface [@langchain2024] with a carefully engineered system prompt that distinguishes valid outdoor public garbage sites from invalid submissions (indoor scenes, single items, unrelated content).

The model returns a structured JSON response containing:

- `label`: `"valid"` or `"invalid"`
- `confidence`: a float between 0.0 and 1.0
- `reason`: a natural language explanation of the classification

Multimodal large language models such as Gemini have demonstrated strong performance on image classification tasks without requiring task-specific fine-tuning [@mllm_classification2024], making them well-suited for this application where labeled training data is scarce.

## 2. Confidence-Based Decision Engine and Human-in-the-Loop Review

A dedicated decision engine applies confidence thresholds to route each submission to the appropriate outcome:

| Confidence        | Label | Decision                 |
| ----------------- | ----- | ------------------------ |
| ≥ 0.75            | valid | Auto-accepted            |
| 0.50–0.75         | valid | Queued for manual review |
| < 0.50 or invalid | any   | Auto-rejected            |

This three-tier routing reduces false positives while preserving human oversight for ambiguous cases. Research into human-in-the-loop AI systems has shown that routing low-confidence decisions to human reviewers significantly improves overall system accuracy and reduces error propagation [@hitl2024]. Submissions in the pending review queue are stored with their image blobs and AI reasoning, enabling administrators to make informed decisions and providing a dataset for future model evaluation or fine-tuning.

## 3. Role-Based Workflow Engine

GreenLoop implements a four-role access model enforced via JWT authentication middleware and a dedicated role authorization layer. The cleanup workflow is strictly sequential:

1. Citizen submits a geotagged report with an image
2. AI validates the image → report marked `verified_dump` or `rejected`
3. Team lead assigns a cleanup task to a worker
4. Worker submits geotagged cleanup proof image
5. AI verifies the cleanup → task marked `completed` or `rework_required`

Each state transition is gated by role checks, ensuring data integrity and preventing unauthorized workflow manipulation. This structured approach mirrors established patterns in civic technology platforms [@seeclickfix] while adding automated validation at each critical step.

## 4. Geospatial Cleanup Verification

To prevent fraudulent cleanup submissions, the system validates the GPS coordinates submitted by workers against the original dump report coordinates using the Haversine formula [@haversine], which computes great-circle distances between two points on the Earth's surface given their latitudes and longitudes:

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cdot \cos\phi_2 \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$d = 2R \cdot \arctan2\left(\sqrt{a}, \sqrt{1-a}\right)$$

If the worker's submitted location is more than 150 metres from the original dump site, the submission is automatically rejected with a `rework_required` status without requiring manual review. This geospatial check provides a lightweight but effective fraud prevention mechanism that complements the AI image validation layer.

## 5. Audit Logging and Transparency

All AI validation decisions — including raw model responses, confidence scores, reasoning strings, and final outcomes — are persisted to a SQLite database via SQLAlchemy. This audit trail serves multiple purposes: it provides transparency and accountability for automated decisions, enables administrators to review and appeal rejected submissions, and accumulates a labeled dataset of validation outcomes that can support future research into model performance and bias in civic AI applications.

# Comparison with Existing Tools

| Feature                     | GreenLoop | SeeClickFix      | Commercial Platforms |
| --------------------------- | --------- | ---------------- | -------------------- |
| Open source                 | ✅        | ❌               | ❌                   |
| AI image validation         | ✅        | ❌               | Partial              |
| Human-in-the-loop review    | ✅        | ✅ (manual only) | Varies               |
| Geospatial fraud prevention | ✅        | ❌               | Varies               |
| Full cleanup workflow       | ✅        | ❌               | Varies               |
| Audit logging               | ✅        | ❌               | Varies               |

# Acknowledgements

The authors acknowledge the use of Google Gemini 2.5 Flash via the LangChain framework for AI-powered image classification, Cloudinary for image storage infrastructure, and MongoDB Atlas for cloud database services.

# References

- **UN SDG 11**: United Nations. (2015). _Transforming our world: the 2030 Agenda for Sustainable Development — Goal 11: Sustainable Cities and Communities_. UN General Assembly. https://sdgs.un.org/goals/goal11

- **LangChain**: Chase, H. et al. (2022). _LangChain: Building applications with LLMs through composability_. GitHub. https://github.com/langchain-ai/langchain

- **SeeClickFix**: SeeClickFix Inc. (2008). _SeeClickFix: Civic Issue Reporting Platform_. https://seeclickfix.com

- **Vietnam AI Waste Monitoring**: Vietnam.vn. (2026). _AI-powered waste monitoring_. https://www.vietnam.vn/en/giam-sat-rac-thai-bang-ai

- **City Detect**: City Detect. (2024). _City Detect raises $13M Series A to scale civic AI_. https://www.findarticles.com/city-detect-raises-13m-series-a-to-scale-civic-ai/

- **MLLM Classification**: Anonymous. (2024). _Multimodal Large Language Models as Image Classifiers_. arXiv:2603.06578. https://arxiv.org/html/2603.06578v1

- **Human-in-the-Loop AI**: Anyreach AI. (2024). _What is Human-in-the-Loop in Agentic AI? Enterprise Guide to Reliable AI Fallback_. https://blog.anyreach.ai/what-is-human-in-the-loop-in-agentic-ai-enterprise-guide-to-reliable-ai-fallback/

- **Microservices Architecture**: Aegis Softtech. (2023). _Building Scalable Node.js Microservices_. https://www.aegissofttech.com/insights/building-scalable-node-js-microservices

- **Haversine Formula**: Sinnott, R. W. (1984). _Virtues of the Haversine_. Sky and Telescope, 68(2), 159.
