\restrict dbmate

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: common_details; Type: TABLE; Schema: public; Owner: -
-- 

CREATE TABLE public.common_details (
    id integer NOT NULL,
    overall integer,
    velocity integer,
    shooting integer,
    passing integer,
    dribbling integer,
    defending integer,
    physicality integer,
    player_id integer NOT NULL
);


--
-- Name: common_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.common_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: common_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.common_details_id_seq OWNED BY public.common_details.id;


--
-- Name: foots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.foots (
    id integer NOT NULL,
    name character varying(6)
);


--
-- Name: foots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.foots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: foots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.foots_id_seq OWNED BY public.foots.id;


--
-- Name: goalkeeper_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goalkeeper_details (
    id integer NOT NULL,
    diving integer,
    handling integer,
    kicking integer,
    positioning integer,
    reflexes integer,
    player_id integer NOT NULL
);


--
-- Name: goalkeeper_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goalkeeper_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goalkeeper_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goalkeeper_details_id_seq OWNED BY public.goalkeeper_details.id;


--
-- Name: leagues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leagues (
    id integer NOT NULL,
    name character varying(30),
    nation_id integer
);


--
-- Name: leagues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leagues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leagues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leagues_id_seq OWNED BY public.leagues.id;


--
-- Name: nations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nations (
    id integer NOT NULL,
    name character varying(40)
);


--
-- Name: nations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nations_id_seq OWNED BY public.nations.id;


--
-- Name: play_styles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.play_styles (
    id integer NOT NULL,
    name character varying(30)
);


--
-- Name: play_styles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.play_styles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: play_styles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.play_styles_id_seq OWNED BY public.play_styles.id;


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    id integer NOT NULL,
    name character varying(60),
    rank integer,
    weak_foot integer,
    skill_moves integer,
    heigth integer,
    weight integer,
    age integer,
    url character varying(120),
    foot_id integer NOT NULL,
    sex_id integer NOT NULL,
    position_id integer NOT NULL,
    nation_id integer NOT NULL,
    team_id integer NOT NULL
);


--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- Name: players_play_styles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players_play_styles (
    id integer NOT NULL,
    play_style_id integer NOT NULL,
    player_id integer NOT NULL
);


--
-- Name: players_play_styles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.players_play_styles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: players_play_styles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.players_play_styles_id_seq OWNED BY public.players_play_styles.id;


--
-- Name: players_positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players_positions (
    id integer NOT NULL,
    position_id integer NOT NULL,
    player_id integer NOT NULL
);


--
-- Name: players_positions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.players_positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: players_positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.players_positions_id_seq OWNED BY public.players_positions.id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    name character varying(10)
);


--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: sexs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sexs (
    id integer NOT NULL,
    name character varying(7)
);


--
-- Name: sexs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sexs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sexs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sexs_id_seq OWNED BY public.sexs.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(40),
    league_id integer NOT NULL
);


--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: common_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.common_details ALTER COLUMN id SET DEFAULT nextval('public.common_details_id_seq'::regclass);


--
-- Name: foots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foots ALTER COLUMN id SET DEFAULT nextval('public.foots_id_seq'::regclass);


--
-- Name: goalkeeper_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goalkeeper_details ALTER COLUMN id SET DEFAULT nextval('public.goalkeeper_details_id_seq'::regclass);


--
-- Name: leagues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues ALTER COLUMN id SET DEFAULT nextval('public.leagues_id_seq'::regclass);


--
-- Name: nations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nations ALTER COLUMN id SET DEFAULT nextval('public.nations_id_seq'::regclass);


--
-- Name: play_styles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.play_styles ALTER COLUMN id SET DEFAULT nextval('public.play_styles_id_seq'::regclass);


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- Name: players_play_styles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players_play_styles ALTER COLUMN id SET DEFAULT nextval('public.players_play_styles_id_seq'::regclass);


--
-- Name: players_positions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players_positions ALTER COLUMN id SET DEFAULT nextval('public.players_positions_id_seq'::regclass);


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: sexs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sexs ALTER COLUMN id SET DEFAULT nextval('public.sexs_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: common_details common_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.common_details
    ADD CONSTRAINT common_details_pkey PRIMARY KEY (id);


--
-- Name: foots foots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foots
    ADD CONSTRAINT foots_pkey PRIMARY KEY (id);


--
-- Name: goalkeeper_details goalkeeper_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goalkeeper_details
    ADD CONSTRAINT goalkeeper_details_pkey PRIMARY KEY (id);


--
-- Name: leagues leagues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_pkey PRIMARY KEY (id);


--
-- Name: nations nations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nations
    ADD CONSTRAINT nations_pkey PRIMARY KEY (id);


--
-- Name: play_styles play_styles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.play_styles
    ADD CONSTRAINT play_styles_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: players_play_styles players_play_styles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players_play_styles
    ADD CONSTRAINT players_play_styles_pkey PRIMARY KEY (id);


--
-- Name: players_positions players_positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players_positions
    ADD CONSTRAINT players_positions_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sexs sexs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sexs
    ADD CONSTRAINT sexs_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: common_details common_details_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.common_details
    ADD CONSTRAINT common_details_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: goalkeeper_details goalkeeper_details_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goalkeeper_details
    ADD CONSTRAINT goalkeeper_details_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: leagues leagues_nation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_nation_id_fkey FOREIGN KEY (nation_id) REFERENCES public.nations(id);


--
-- Name: players players_foot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_foot_id_fkey FOREIGN KEY (foot_id) REFERENCES public.foots(id);


--
-- Name: players players_nation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_nation_id_fkey FOREIGN KEY (nation_id) REFERENCES public.nations(id);


--
-- Name: players_play_styles players_play_styles_play_style_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players_play_styles
    ADD CONSTRAINT players_play_styles_play_style_id_fkey FOREIGN KEY (play_style_id) REFERENCES public.play_styles(id);


--
-- Name: players_play_styles players_play_styles_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players_play_styles
    ADD CONSTRAINT players_play_styles_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: players players_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: players_positions players_positions_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players_positions
    ADD CONSTRAINT players_positions_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: players_positions players_positions_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players_positions
    ADD CONSTRAINT players_positions_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: players players_sex_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_sex_id_fkey FOREIGN KEY (sex_id) REFERENCES public.sexs(id);


--
-- Name: players players_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: teams teams_league_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_league_id_fkey FOREIGN KEY (league_id) REFERENCES public.leagues(id);


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20240923001357'),
    ('20240923001430'),
    ('20240923001435'),
    ('20240923001454'),
    ('20240923001519'),
    ('20240923001531'),
    ('20240923001537'),
    ('20240923001538'),
    ('20240923001700'),
    ('20240923001723'),
    ('20240923001817'),
    ('20240923001826'),
    ('20240923014951'),
    ('20240923015353'),
    ('20240923020831'),
    ('20240923023448'),
    ('20240923023547'),
    ('20240923031932'),
    ('20240923052437'),
    ('20240929033656'),
    ('20240929053853'),
    ('20240929054710'),
    ('20240929061027'),
    ('20240929061638');
