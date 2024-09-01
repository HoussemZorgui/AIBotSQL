--------------
conn /as sysdba

1----------------------------------------------------------------
CREATE TABLESPACE TBL01
DATAFILE 'fd01tbl01.dbf' SIZE 6M,
          'fd02tbl01.dbf' SIZE 4M;
------------------------------------------------------------------
2----------------------------------------------------------------
alter database default tablesapace TBL01;
------------------------------------------------------------------
create tablespace TBL02 
DATAFILE 'fd01tbl02.dbf' SIZE 10M,
          'fd02tbl02.dbf' SIZE 10M,
          'fd0xbl02.dbf' SIZE 5M;
3----------------------------------------------------------------
alter tablespace TBL01 
add datafile 'fd03tbl01.dbf' size 20M ;
-------------------------------------------------------------------
5------------------------------------------------------------------
etapes de renommage fichier :
1- shutdown immediate
2- exit
3- renommer fichier physiquement 
4- startup mount 
5- ALTER DATABASE RENAME FILE
 'C:\ORACLEXE\APP\ORACLE\PRODUCT\11.2.0\SERVER\DATABASE\fd0xbl02.dbf' TO 'C:\ORACLEXE\APP\ORACLE\PRODUCT\11.2.0\SERVER\DATABASE\fd03bl02.dbf';
6- alter database open:
-----------------------------------------------------
6-------------------------------------------------------------------
select tablesapace_name from dba_tablespaces
-----------------------------------------------------
7-----------------------------------------------------------------------
create or replace procedure pr_tablespace is

  v_tablespace_name VARCHAR2(30);
  v_file_count NUMBER;
BEGIN
  
  FOR ts IN (SELECT tablespace_name FROM dba_tablespaces) LOOP
    v_tablespace_name := ts.tablespace_name;

    SELECT COUNT(*)
    INTO v_file_count
    FROM dba_data_files
    WHERE tablespace_name = v_tablespace_name;

    DBMS_OUTPUT.PUT_LINE('Tablespace : ' || v_tablespace_name || ', Nombre de fichiers : ' || v_file_count);
  END LOOP;
END;
/

set serveroutput on;
exec pr_tablespace;
----------------------------------------------------------------------
8--------------------------------------------------------------------
alter tablespace TBL01 
add datafile 'fd04tlb01.dbf' size 2M 
autoextend on next 1M MAXSIZE 4M;
--------------------------------------------------------------------
9--------------------------------------------------------------------
CREATE TEMPORARY TABLESPACE MonTemp
TEMPFILE 'MonTempfile.dbf' SIZE 5M;

ALTER DATABASE DEFAULT TEMPORARY TABLESPACE MonTemp;
----------------------------------------------------------------------
10----------------------------------------------------------------
CREATE OR REPLACE FUNCTION FN_NBR_TAB_TEMP RETURN NUMBER IS
  v_count NUMBER;
BEGIN
  
  SELECT COUNT(*)
  INTO v_count
  FROM dba_tablespaces
  WHERE contents = 'TEMPORARY';

  RETURN v_count;
END FN_NBR_TAB_TEMP;
/

set serveroutput on;

DECLARE
  v_result NUMBER;
BEGIN
  v_result := FN_NBR_TAB_TEMP;
  DBMS_OUTPUT.PUT_LINE('Nombre de tablespaces temporaires : ' || v_result);
END;
/
-------------------------------------------------------------------------
11-------------------------------------------------------------------------
CREATE USER TD3 IDENTIFIED BY td3 DEFAULT TABLESPACE TBL01;

SELECT TEMPORARY_TABLESPACE
FROM DBA_USERS
WHERE USERNAME = 'TD3';
12-------------------------------------------------------------------------
DROP TABLESPACE TBL01 INCLUDING CONTENTS AND DATAFILES;

SELECT DEFAULT_TABLESPACE
FROM DBA_USERS
WHERE USERNAME = 'TD3';
------------------------------------------------------