package com.haui.coffee_shop.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "conversation")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    
    @Column(name = "is_readed")
    private boolean readed;

    @OneToOne
    @JoinColumn(name = "host_id")
    private User host;

}
