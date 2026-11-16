---
title: 'VITAL: Patient Digital Twin'
summary: 'A dataset-agnostic patient digital twin that fuses clinical and consumer-wearable data through a single adapter → ontology → twin pipeline.'
role: 'Project leader and lead engineer'
year: 2026
timeframe: 'Started Apr 2026, ongoing'
team: '4 people'
context: 'TP-KMD course, Otto-von-Guericke University Magdeburg'
stack:
  [
    'Python',
    'FastAPI',
    'React',
    'pandas',
    'scikit-learn',
    'XGBoost',
    'pytest',
    'Git/GitHub',
  ]
# No codeUrl or demoUrl: the repository is private and the data is under an NDA.
order: 1
---

## The problem

VITAL shows where a patient is heading, not just a single model output: clinical data flows through an adapter, an ontology and a twin core. In this phase we extended it to rheumatoid arthritis. Clinicians and researchers can now see everyday wellbeing from a fitness watch (heart rate, sleep, activity, stress) right next to clinical disease-activity scores.

## What I did

I led the team and the engineering. I built the patient dashboard, implemented the core PatientTwin module with tests and a handover document, and merged several team branches into one working codebase, untangling environment and dependency problems on the way. I also led the wearable integration, which merges clinic and sensor data, and designed the evaluation, including a multi-task prediction matrix.

## Outcome

The twin runs end to end. The dataset has 131 clinical visit windows from 63 rheumatoid arthritis patients, with wearable data for 18 of those windows (11 patients). After I fixed an ID-format mismatch, all 18 wearable records matched their clinical windows, and 53 automated tests pass. We then compared three setups: clinical data only, wearable data only, and both combined. In these preliminary results, fusion did not significantly beat the clinical-only baseline. For next-visit DAS28 (a standard disease-activity score), a random forest reached an RMSE of 1.154 with clinical data and 1.148 with fusion. For adherence, the AUROC was 0.709 versus 0.706. Our conclusion is that wearable coverage (about 14% of windows) was too low to demonstrate any benefit from fusion.

## What I learned

In a team project, the hardest problems were coordination and integration, getting one source of truth across parallel implementations, more than writing new code. Owning the work end to end also meant making honest calls under real data constraints and not overstating what the data could support. Running everything from architecture to dashboard to presenting the evaluation made me better at scoping, sequencing and explaining trade-offs to a mixed audience.

## Credits

Built with three teammates in the TP-KMD course at Otto-von-Guericke University Magdeburg. The clinical and wearable data is covered by an NDA, so the code, data and screenshots aren't public.
