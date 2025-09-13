-- Insert initial event types
INSERT INTO "EventType" (id, name, description, "isActive", "createdAt", "updatedAt") VALUES 
(gen_random_uuid(), 'Young People Church Living', 'Annual Young People Church Living conference and accommodation', true, now(), now()),
(gen_random_uuid(), 'District Conference', 'District-wide conference meetings and gatherings', true, now(), now()),
(gen_random_uuid(), 'Regional Meeting', 'Regional ministry meetings and conferences', true, now(), now());