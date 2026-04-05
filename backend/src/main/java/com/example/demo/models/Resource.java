package com.example.demo.models;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    private String id;

    @NotBlank
    private String name;

    @NotNull
    private ResourceType type;

    @Min(1)
    private int capacity;

    @NotBlank
    private String location;

    @NotNull
    private ResourceStatus status;

    @Valid
    @NotNull
    private List<AvailabilityWindow> availabilityWindows;
}
