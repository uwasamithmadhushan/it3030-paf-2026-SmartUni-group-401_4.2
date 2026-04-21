package com.example.demo.bookings;

public class BookingCountByResource {

    private String resourceId;
    private long count;

    public BookingCountByResource() {}

    public BookingCountByResource(String resourceId, long count) {
        this.resourceId = resourceId;
        this.count = count;
    }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
