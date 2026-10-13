package com.project.bookmyshow.repository;

import com.project.bookmyshow.model.NotificationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRecordRepository extends JpaRepository<NotificationRecord, Long> {

    List<NotificationRecord> findByRecipientOrderBySentAtDesc(String recipient);
}

