SELECT p.id, p.name, p.embedding_count, COUNT(fd.id) as descriptor_count
FROM Person p
LEFT JOIN FaceDescriptor fd ON fd.person_id = p.id
GROUP BY p.id, p.name, p.embedding_count
ORDER BY p.id;
