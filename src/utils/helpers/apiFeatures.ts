class ApiFeatures {
  constructor(
    public query: string,
    public queryString: {
      // * object with string keys and any values
      [key: string]: any;
    },
    public args: any[] = [],
    public table: string
  ) {
    this.query = query;
    this.queryString = queryString;
    this.args = args;
    this.table = table;
  }

  public filter() {
    const queryObj: object & {
      // * object with string keys and any values
      [key: string]: any;
    } = Object.assign({}, this.queryString);

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);

    console.log('queryStr', queryStr);
    console.log('queryObj', queryObj);
    // * Add where clause to query
    if (queryStr !== '{}') {
      this.query = `${this.query} WHERE`;

      console.log('typeof queryObj', typeof queryObj);
      // * Convert array like string to array
      // * e.g { id: '[11,7,3]', firstName: 'Niko' } => { id: [11,7,3], firstName: 'Niko' }
      Object.keys(queryObj).forEach((key: string) => {
        if (queryObj[key].includes('[')) {
          queryObj[key] = queryObj[key].replace('[', '').replace(']', '');
          queryObj[key] = queryObj[key].split(',');
        }
      });

      console.log('queryObj', queryObj);

      Object.entries(queryObj).forEach(
        (entry: [string, string], index: number) => {
          // * If value is an array, add IN clause
          // * e.g { id: [11,7,3], firstName: 'Niko' } => WHERE id IN (11,7,3) AND firstName = 'Niko'

          if (Array.isArray(entry[1])) {
            let inClause = '';
            entry[1].forEach((value: string, index: number) => {
              if (index > 0) {
                inClause += ',';
              }
              inClause += ` ?`;
              this.args.push(value);
            });

            this.query += ` ${entry[0]} IN (${inClause})`;
          } else {
            // * If value is not an array, add = clause
            // * e.g { id: 11, firstName: 'Niko' } => WHERE id = 11 AND firstName = 'Niko'
            if (index > 0) {
              this.query += ' AND';
            }

            // * if value is like 11-12 , add BETWEEN clause
            // * e.g { id: '11-12', firstName: 'Niko' } => WHERE id BETWEEN 11 AND 12 AND firstName = 'Niko'
            if (entry[1].includes('-')) {
              const values = entry[1].split('-');
              this.query += ` ${entry[0]} BETWEEN ? AND ?`;
              this.args.push(values[0]);
              this.args.push(values[1]);
            } else {
              this.query += ` ${entry[0]} = ?`;
              this.args.push(entry[1]);
            }
          }
        }
      );
    }
    return this;
  }

  public sort() {
    if (this.queryString.sort) {
      this.query += ` ORDER BY`;
      this.queryString.sort
        .split(',')
        .forEach((orderBy: string, index: number) => {
          if (index > 0) {
            this.query += ',';
          }
          this.query += ` ${orderBy.replace('-', '')}`;

          const isDescending = orderBy.includes('-');
          if (isDescending) {
            this.query += ' DESC';
          } else {
            this.query += ' ASC';
          }
        });
    }

    return this;
  }

  public paginate() {
    if (!this.queryString.page || !this.queryString.limit) return this;
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query += ` LIMIT ${skip}, ${limit}`;

    return this;
  }
}

export default ApiFeatures;
