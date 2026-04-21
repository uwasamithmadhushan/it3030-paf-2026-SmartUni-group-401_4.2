package com.example.demo.bookings;

public class PeakHourResult {

    /** Hour of day (0–23) extracted from bookings' startTime. */
    private int hour;

    /** Number of bookings that start during this hour. */
    private long count;

    public PeakHourResult() {}

    public PeakHourResult(int hour, long count) {
        this.hour = hour;
        this.count = count;
    }

    public int getHour() { return hour; }
    public void setHour(int hour) { this.hour = hour; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
