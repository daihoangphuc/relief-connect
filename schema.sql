-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Relief Requests Table (No foreign key to users - anonymous system)
create table relief_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid, -- Anonymous, no foreign key constraint
  title text not null,
  description text,
  latitude float not null,
  longitude float not null,
  address text,
  contact_phone text, -- Phone number for emergency contact
  status int default 0, -- 0: Open, 1: InProgress, 2: Completed, 3: Cancelled
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Request Items Table
create table request_items (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null,
  item_name text not null,
  quantity_needed int not null,
  unit text
);

-- Relief Missions Table (No foreign key constraints - anonymous donors)
create table relief_missions (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null,
  donor_id uuid, -- Anonymous donor
  started_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  proof_image text
);

-- Enable Row Level Security (RLS) - Allow all for MVP
alter table relief_requests enable row level security;
alter table request_items enable row level security;
alter table relief_missions enable row level security;

-- Create policies (Allow all for MVP simplicity)
create policy "Public Access" on relief_requests for all using (true);
create policy "Public Access" on request_items for all using (true);
create policy "Public Access" on relief_missions for all using (true);

-- Create indexes for better performance
create index idx_relief_requests_status on relief_requests(status);
create index idx_relief_requests_created_at on relief_requests(created_at desc);
create index idx_request_items_request_id on request_items(request_id);
create index idx_relief_missions_request_id on relief_missions(request_id);
