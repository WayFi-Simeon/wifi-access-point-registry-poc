const Joi = require('joi');

const accessPointSchema = Joi.object({
    nasid: Joi.string()
        .required()
        .pattern(/^[a-fA-F0-9:]+$/)
        .message('NASID must be a valid MAC address format'),
    
    location_name: Joi.string()
        .required()
        .min(1)
        .max(255)
        .trim(),
    
    street_address: Joi.string()
        .required()
        .min(1)
        .max(255)
        .trim(),
    
    city: Joi.string()
        .required()
        .min(1)
        .max(100)
        .trim(),
    
    state: Joi.string()
        .max(100)
        .trim()
        .allow(''),
    
    zip_code: Joi.string()
        .required()
        .min(1)
        .max(20)
        .trim(),
    
    country: Joi.string()
        .required()
        .min(1)
        .max(100)
        .trim(),
    
    latitude: Joi.number()
        .required()
        .min(-90)
        .max(90)
        .precision(8),
    
    longitude: Joi.number()
        .required()
        .min(-180)
        .max(180)
        .precision(8),
    
    wifi_group: Joi.string()
        .required()
        .valid(
            'OUTDOOR', 'MERCANTILE', 'HOSPITALITY', 'EDUCATIONAL', 
            'HEALTHCARE', 'TRANSPORTATION', 'GOVERNMENT', 'RESIDENTIAL',
            'INDUSTRIAL', 'ENTERTAINMENT', 'RELIGIOUS', 'OTHER'
        ),
    
    wifi_type_categorization: Joi.string()
        .required()
        .valid(
            'CITY PARK', 'SHOPPING MALL', 'RETAIL STORE', 'RESTAURANT',
            'HOTEL', 'AIRPORT', 'TRAIN STATION', 'UNIVERSITY', 'SCHOOL',
            'HOSPITAL', 'LIBRARY', 'OFFICE BUILDING', 'APARTMENT',
            'WAREHOUSE', 'STADIUM', 'THEATER', 'CHURCH', 'OTHER'
        ),
    
    ap_make: Joi.string()
        .required()
        .min(1)
        .max(100)
        .trim(),
    
    ap_model: Joi.string()
        .required()
        .min(1)
        .max(100)
        .trim(),
    
    estimated_upload_speed: Joi.number()
        .required()
        .integer()
        .min(1)
        .max(10000),
    
    estimated_download_speed: Joi.number()
        .required()
        .integer()
        .min(1)
        .max(10000),
    
    isp: Joi.string()
        .required()
        .min(1)
        .max(100)
        .trim(),
    
    venue_type: Joi.string()
        .max(100)
        .trim()
        .allow('', null),
    
    ssid: Joi.string()
        .required()
        .min(1)
        .max(255)
        .trim(),
    
    bssid: Joi.string()
        .pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
        .message('BSSID must be a valid MAC address format')
        .allow('', null),
    
    venue_name_alt: Joi.string()
        .max(255)
        .trim()
        .allow('', null),
    
    foot_traffic_estimates: Joi.string()
        .required()
        .valid('Low', 'Medium', 'High', 'Very High')
});

const updateAccessPointSchema = accessPointSchema.fork(
    ['nasid', 'location_name', 'street_address', 'city', 'zip_code', 
     'country', 'latitude', 'longitude', 'wifi_group', 'wifi_type_categorization',
     'ap_make', 'ap_model', 'estimated_upload_speed', 'estimated_download_speed',
     'isp', 'ssid', 'foot_traffic_estimates'],
    (schema) => schema.optional()
);

const geocodeSchema = Joi.object({
    address: Joi.string()
        .required()
        .min(3)
        .max(500)
        .trim(),
    
    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(5)
});

module.exports = {
    accessPointSchema,
    updateAccessPointSchema,
    geocodeSchema
};
