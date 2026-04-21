package com.example.demo.dto;

public class TechnicianPerformanceResult {

    /** The assigned technician's user ID. */
    private String technicianId;

    /**
     * Average time (in milliseconds) from ticket creation to resolution
     * across all RESOLVED tickets assigned to this technician.
     */
    private double avgResolutionTimeMs;

    public TechnicianPerformanceResult() {}

    public TechnicianPerformanceResult(String technicianId, double avgResolutionTimeMs) {
        this.technicianId = technicianId;
        this.avgResolutionTimeMs = avgResolutionTimeMs;
    }

    public String getTechnicianId() { return technicianId; }
    public void setTechnicianId(String technicianId) { this.technicianId = technicianId; }

    public double getAvgResolutionTimeMs() { return avgResolutionTimeMs; }
    public void setAvgResolutionTimeMs(double avgResolutionTimeMs) { this.avgResolutionTimeMs = avgResolutionTimeMs; }
}
