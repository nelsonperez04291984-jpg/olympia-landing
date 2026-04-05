/**
 * FHIR R4 Mapper for Home Health Referrals
 * Maps a FHIR Bundle (Patient + ServiceRequest + Condition) to internal database fields.
 */

export const mapFhirBundleToReferral = (bundle) => {
    if (!bundle || bundle.resourceType !== 'Bundle') {
        throw new Error('Invalid FHIR Bundle');
    }

    const resources = bundle.entry.map(e => e.resource);
    
    // 1. Extract Patient (Demographics)
    const patient = resources.find(r => r.resourceType === 'Patient');
    const patientName = patient ? extractPatientName(patient) : 'Unknown Patient';
    const patientDob = patient ? patient.birthDate : null;
    const patientPhone = patient?.telecom?.find(t => t.system === 'phone')?.value || null;

    // 2. Extract ServiceRequest (The Referral Order)
    const serviceRequest = resources.find(r => r.resourceType === 'ServiceRequest');
    const externalId = serviceRequest?.id || `fhir-${Date.now()}`;
    const servicesNeeded = serviceRequest?.code?.text || 'Home Health Services';
    
    // 3. Extract Condition (Diagnosis)
    const condition = resources.find(r => r.resourceType === 'Condition');
    const diagnosis = condition?.code?.text || serviceRequest?.reasonCode?.[0]?.text || 'No Diagnosis Provided';
    const icdPrimary = condition?.code?.coding?.find(c => c.system.includes('icd10'))?.code || null;

    return {
        patient_name: patientName,
        patient_dob: patientDob,
        patient_phone: patientPhone,
        diagnosis: diagnosis,
        icd_primary: icdPrimary,
        services_needed: servicesNeeded,
        external_id: externalId,
        source: 'FHIR_Integration',
        raw_fhir: bundle
    };
};

const extractPatientName = (patient) => {
    const nameObj = patient.name?.[0];
    if (!nameObj) return 'Unnamed';
    const given = nameObj.given?.join(' ') || '';
    const family = nameObj.family || '';
    return `${given} ${family}`.trim();
};
