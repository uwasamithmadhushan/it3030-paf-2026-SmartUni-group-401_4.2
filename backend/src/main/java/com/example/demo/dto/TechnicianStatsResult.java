package com.example.demo.dto;

public class TechnicianStatsResult {

    private String technicianId;
    private String technicianName;
    private long resolvedCount;
    /** Average milliseconds from ticket creation to resolution. Null when no resolvedAt data. */
    private Double avgResolutionTimeMs;

    public TechnicianStatsResult() {}

    public String getTechnicianId() { return technicianId; }
    public void setTechnicianId(String technicianId) { this.technicianId = technicianId; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public long getResolvedCount() { return resolvedCount; }
    public void setResolvedCount(long resolvedCount) { this.resolvedCount = resolvedCount; }

    public Double getAvgResolutionTimeMs() { return avgResolutionTimeMs; }
    public void setAvgResolutionTimeMs(Double avgResolutionTimeMs) { this.avgResolutionTimeMs = avgResolutionTimeMs; }
}
