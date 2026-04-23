package com.example.demo.dto;

public class ResourceUsageDTO {

    private String resourceId;
    private String resourceName;
    private long bookingCount;
    private double usagePercentage;

    public ResourceUsageDTO() {}

    public ResourceUsageDTO(String resourceId, String resourceName,
                             long bookingCount, double usagePercentage) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.bookingCount = bookingCount;
        this.usagePercentage = usagePercentage;
    }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public long getBookingCount() { return bookingCount; }
    public void setBookingCount(long bookingCount) { this.bookingCount = bookingCount; }

    public double getUsagePercentage() { return usagePercentage; }
    public void setUsagePercentage(double usagePercentage) { this.usagePercentage = usagePercentage; }
}
