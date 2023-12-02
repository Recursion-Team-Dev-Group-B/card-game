class Storage {
  set = (key: string, value: any) => {
    localStorage.setItem(key, value);
  };

  get = (key: string) => {
    let value: any = localStorage.getItem(key);
    if (value == undefined) {
      return undefined;
    } else {
      return value;
    }
  };

  remove = (key: string) => {
    localStorage.removeItem(key);
  };
}

export default Storage;
