// Organization / Person
export const mapOrganizationPerson = (value) => {
  const map = {
    organization: 124620000,
    person: 124620001,
  };
  return map[value];
};

// Building Type
export const mapBuildingType = (value) => {
  const map = {
    residential: 124620000,
    commercial: 124620001,
    industrial: 124620002,
  };
  return map[value];
};

// Product Category
export const mapProductCategory = (value) => {
  const map = {
    pump: 124620000,
    ac: 124620001,
    motor: 124620002,
    panel: 124620003,
    pressure_vessel: 124620004,
    car: 124620005,
  };
  return map[value];
};

// Pump Symptoms
export const mapPumpSymptoms = (value) => {
  const map = {
    not_starting: 124620000,
    low_pressure: 124620001,
    no_flow: 124620002,
    noise: 124620003,
    vibration: 124620004,
    overheating: 124620005,
    leakage: 124620006,
    tripping: 124620007,
  };
  return map[value];
};

// Pump Observed Signs
export const mapPumpObservedSigns = (value) => {
  const map = {
    motor_runs_no_discharge: 124620000,
    air_bubbles: 124620001,
    pressure_fluctuation: 124620002,
    seal_leaking: 124620003,
    burnt_smell: 124620004,
  };
  return map[value];
};

// Pump Suspected Area
export const mapPumpSuspectedArea = (value) => {
  const map = {
    motor: 124620000,
    impeller: 124620001,
    seal: 124620002,
    bearing: 124620003,
    panel: 124620004,
    electrical: 124620005,
    piping: 124620006,
    not_sure: 124620007,
  };
  return map[value?.toLowerCase?.()];
};

// AC Symptoms
export const mapACSymptoms = (value) => {
  const map = {
    not_cooling: 124620000,
    not_starting: 124620001,
    water_leakage: 124620002,
    smell: 124620003,
    noise: 124620004,
    ice: 124620005,
  };
  return map[value];
};

// AC Fault Area
export const mapACFaultArea = (value) => {
  const map = {
    compressor: 124620000,
    pcb: 124620001,
    gas: 124620002,
    fan_motor: 124620003,
    sensor: 124620004,
    drain: 124620005,
  };
  return map[value?.toLowerCase?.()];
};

// Car Symptoms
export const mapCarSymptoms = (value) => {
  const map = {
    not_starting: 124620000,
    hard_starting: 124620001,
    engine_noise: 124620002,
    vibration: 124620003,
    overheating: 124620004,
    smoke: 124620005,
    poor_acceleration: 124620006,
    stalling: 124620007,
    warning_light_on: 124620008,
    ac_not_working: 124620009,
    brake_issue: 124620010,
    steering_issue: 124620011,
  };
  return map[value];
};

// Car Observed Signs
export const mapCarObservedSigns = (value) => {
  const map = {
    check_engine_light: 124620000,
    oil_leak: 124620001,
    coolant_leak: 124620002,
    brake_fluid_leak: 124620003,
    burning_smell: 124620004,
    battery_warning: 124620005,
    abs_light: 124620006,
    low_power: 124620007,
    excessive_smoke: 124620008,
  };
  return map[value];
};

// Warning Lights
export const mapWarningLights = (value) => {
  const map = {
    engine: 124620000,
    abs: 124620001,
    battery: 124620002,
    oil: 124620003,
    temperature: 124620004,
    airbag: 124620005,
    tpms: 124620006,
  };
  return map[value];
};

// Urgency
export const mapUrgency = (value) => {
  const map = {
    critical: 124620000,
    high: 124620001,
    medium: 124620002,
    low: 124620003,
  };
  return map[value];
};

// Business Impact
export const mapBusinessImpact = (value) => {
  const map = {
    production_stop: 124620000,
    water_supply_affected: 124620001,
    customer_complaint: 124620002,
    comfort_only: 124620003,
  };
  return map[value];
};

// Contract Type
export const mapContractType = (value) => {
  const map = {
    amc: 124620000,
    warranty: 124620001,
    chargeable: 124620002,
  };
  return map[value?.toLowerCase?.()];
};

// Vehicle Type
export const mapVehicleType = (value) => {
  const map = {
    sedan: 124620000,
    suv: 124620001,
    pickup: 124620002,
    van: 124620003,
    truck: 124620004,
  };
  return map[value?.toLowerCase?.()];
};

// Fuel Type
export const mapFuelType = (value) => {
  const map = {
    petrol: 124620000,
    diesel: 124620001,
    electric: 124620002,
    hybrid: 124620003,
  };
  return map[value?.toLowerCase?.()];
};

// Car Brand
export const mapCarBrand = (value) => {
  const map = {
    toyota: 124620000,
    nissan: 124620001,
    bmw: 124620002,
    mercedes: 124620003,
    audi: 124620004,
    ford: 124620005,
    other: 124620006,
  };
  return map[value?.toLowerCase?.()];
};

// Noise Location
export const mapNoiseLocation = (value) => {
  const map = {
    engine: 124620000,
    front_wheels: 124620001,
    rear_wheels: 124620002,
    underbody: 124620003,
    exhaust: 124620004,
  };
  return map[value?.toLowerCase?.()];
};

// Car Suspected Area
export const mapCarSuspectedArea = (value) => {
  const map = {
    engine: 124620000,
    transmission: 124620001,
    battery: 124620002,
    electrical: 124620003,
    brakes: 124620004,
    suspension: 124620005,
    steering: 124620006,
    cooling_system: 124620007,
    fuel_system: 124620008,
    ac_system: 124620009,
    exhaust: 124620010,
    not_sure: 124620011,
  };
  return map[value?.toLowerCase?.()];
};

// Transmission
export const mapTransmission = (value) => {
  const map = {
    automatic: 124620000,
    manual: 124620001,
  };
  return map[value?.toLowerCase?.()];
};

// Preferred Visit
export const mapPreferredVisit = (value) => {
  const map = {
    asap: 124620000,
    today: 124620001,
    tomorrow: 124620002,
    later: 124620003,
  };
  return map[value];
};
