export type FilePath = string & {
  format: "files/{full_year}/{month}/{file_name}.{file_extension}";
};
