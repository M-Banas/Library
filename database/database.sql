-- DROP SCHEMA public;

CREATE SCHEMA public;


-- DROP SEQUENCE public."Book_id_seq";

CREATE SEQUENCE public."Book_id_seq"
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.borrowed_borrow_id_seq;

CREATE SEQUENCE public.borrowed_borrow_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.copy_id_seq;

CREATE SEQUENCE public.copy_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.users_id_seq;

CREATE SEQUENCE public.users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- public.book definition

-- Drop table

-- DROP TABLE public.book;

CREATE TABLE public.book (
	title varchar NOT NULL,
	author varchar NOT NULL,
	id int4 DEFAULT nextval('"Book_id_seq"'::regclass) NOT NULL,
	description varchar NULL,
	genre varchar NULL,
	CONSTRAINT "Book_pkey" PRIMARY KEY (id)
);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	"name" varchar(100) NOT NULL,
	lname varchar(100) NOT NULL,
	email varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	id serial4 NOT NULL,
	is_admin bool NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);


-- public."copy" definition

-- Drop table

-- DROP TABLE public."copy";

CREATE TABLE public."copy" (
	id serial4 NOT NULL,
	book_id int4 NOT NULL,
	CONSTRAINT copy_pkey PRIMARY KEY (id),
	CONSTRAINT fk_copy_book FOREIGN KEY (book_id) REFERENCES public.book(id)
);


-- public.borrowed definition

-- Drop table

-- DROP TABLE public.borrowed;

CREATE TABLE public.borrowed (
	user_id int4 NOT NULL,
	copy_id int4 NOT NULL,
	borrow_date date DEFAULT CURRENT_TIMESTAMP NULL,
	id int4 DEFAULT nextval('borrowed_borrow_id_seq'::regclass) NOT NULL,
	return_date date NULL,
	expected_return_date date DEFAULT (CURRENT_TIMESTAMP + '7 days'::interval) NULL,
	CONSTRAINT borrowed_pkey PRIMARY KEY (id),
	CONSTRAINT fk_borrowed_copy FOREIGN KEY (copy_id) REFERENCES public."copy"(id),
	CONSTRAINT fk_borrowed_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);