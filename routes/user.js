const express = require("express");

const { body, validationResult } = require("express-validator");

const axios = require("axios");

const FormData = require("form-data");

const QRCode = require('qrcode');

const crypto = require('crypto');

const router = express.Router();

// console.log(crypto.createHmac);

// const baseUrl = "https://mateys.xyz/boombox/api/";
// const baseUrl2 = "https://mateys.xyz/boombox/app/api/connection/query.php";

const baseUrl = "https://api.hiphopboombox.com/api/";
const baseUrl2 = "https://api.hiphopboombox.com/app/api/connection/query.php";

const isAuth = require("../middleware/is_auth");

const selectUrl = (method, data = null) => {
  let config = {
    method: method,
    maxBodyLength: Infinity,
    url: baseUrl2,
    headers: {},
  };

  // console.log(method.toLowerCase());

  if (method.toLowerCase() === "post" && data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    config.data = formData;
    config.headers = { ...formData.getHeaders() }; // Set headers for form data
  }

  return config;
};

const getData = (url, method, data = null) => {
  let config = {
    method: method,
    maxBodyLength: Infinity,
    url: baseUrl + url,
    headers: {},
  };

  // console.log(method.toLowerCase());

  if (method.toLowerCase() === "post" && data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    config.data = formData;
    config.headers = { ...formData.getHeaders() }; // Set headers for form data
  }

  return config;
};

const getData2 = (method, data = null) => {
  let config = {
    method: method,
    maxBodyLength: Infinity,
    url: baseUrl2,
    headers: {},
  };

  // console.log(method.toLowerCase());

  if (method.toLowerCase() === "post" && data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    config.data = formData;
    config.headers = { ...formData.getHeaders() }; // Set headers for form data
  }

  return config;
};

router.get("/", async (req, res, next) => {
  try {
    // console.log(req.session.name == '');
    // const data = await showFirst();
    // console.log(data);
    // const next = req.query.next || false;
    // const prev = req.query.prev || false;
    
    // console.log(req.cookies.lang);

    let pgno = Number(req.query.pgno) || 1;

    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    // console.log(authenticated, req.session.isLoggedIn);

    // console.log(pgno, next, prev, prev == 'true', next == 'false', pgno >= 1 && prev == 'true' && next == 'false');

    // console.log(req.query, next == 'true');

    const response = await axios.request(getData("get/categories.php", "get"));
    const data = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    // console.log(response.data);

    // const postData = { filter: "n" };
    const response2 = await axios.request(
      getData("get/trending.php", "post", { filter: "n" })
    );
    const data2 = response2.data;

    // console.log(data2);
    
    // const postData8 = { filter: "n" };
    const response8 = await axios.request(getData("news/get/trending.php", "post", { filter: "n" }));
    const data8 = response8.data;

    // console.log(data8);

    const today = new Date();

    let data7 = "";

    function padNumber(num) {
      return num.toString().padStart(2, "0");
    }

    // Function to fetch data based on date
    async function fetchData(today, pgno) {
      function formatDate(date) {
        return `${date.getFullYear()}-${padNumber(
          date.getMonth() + 1
        )}-${padNumber(date.getDate())}`;
      }

      // Adjust `today` if `pgno` is provided
      let todayAdjusted = new Date(today).getTime();
      todayAdjusted = new Date(todayAdjusted);

      // Create API request payloads
      const postData2 = { date: formatDate(todayAdjusted) };
      const response3 = await axios.request(
        getData("get/postByDate.php", "post", postData2)
      );
      const data3 = response3.data.slice(0, 10);

      let yesterday = new Date(todayAdjusted).getTime() - 1 * 24 * 3600 * 1000;
      yesterday = new Date(yesterday);
      const postData3 = { date: formatDate(yesterday) };
      const response4 = await axios.request(
        getData("get/postByDate.php", "post", postData3)
      );
      const data4 = response4.data.slice(0, 10);

      let dayBeforeYesterday =
        new Date(todayAdjusted).getTime() - 2 * 24 * 3600 * 1000;
      dayBeforeYesterday = new Date(dayBeforeYesterday);
      const postData4 = { date: formatDate(dayBeforeYesterday) };
      const response5 = await axios.request(
        getData("get/postByDate.php", "post", postData4)
      );
      const data5 = response5.data.slice(0, 10);

      // console.log(todayAdjusted, yesterday, dayBeforeYesterday);
      // console.log(data3, data4, data5);
      // Return all fetched data

      return {
        hData1: data3,
        hData2: data4,
        hData3: data5,
        date4: dayBeforeYesterday.toISOString().split("T")[0],
      };
    }

    if (pgno == 1) {
      // console.log("1");
      data7 = await fetchData(today, 0);
    }
     // else if (pgno >= 1 && next == "true" && prev == "false") {
    //   const x =
    //     new Date(today).getTime() - (Number(pgno) - 1) * (3 * 24 * 3600 * 1000);
    //   // console.log("next", new Date(x));
    //   data7 = await fetchData(x, 0);
    // } else if (pgno >= 1 && prev == "true" && next == "false") {
    //   const x =
    //     new Date(today).getTime() - (Number(pgno) - 1) * (3 * 24 * 3600 * 1000);
    //   // console.log("previous", new Date(x));
    //   data7 = await fetchData(x, 0);
    // } 
    else {
      const x =
        new Date(today).getTime() - (Number(pgno) - 1) * (3 * 24 * 3600 * 1000);
      // console.log(pgno, new Date(x));
      data7 = await fetchData(x, 0);
    }

    const response6 = await axios.request(
      getData("get/featured.php", "post")
    );
    const data6 = response6.data;

    const response10 = await axios.request(getData("get/latestPoll.php", "get"));
    const data10 = response10.data;

    // console.log(data10[0]);
    
//     let data11 = '';
    
//     if (data10.length >= 1) {
//       const postData11 = { "pollId": data10[0]?.id };
//       const response11 = await axios.request(getData("get/getOptions.php", "post", postData11));
//       data11 = response11.data;
//     }
    
    const response12 = await axios.request(getData("get/popDown.php", "get"));
    const data12 = response12.data;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 1 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 1 }));
    const data14 = response14.data;

    // console.log(data13, data14); 
    // console.log(data13[0].code.trim() == '', data13[0].link.trim() == '');
    
    // console.log(data12);

    // console.log(data11);
    
    // console.log(data6);

    // const fData =
    //   data7.hData1 != "" && data2 != ""
    //     ? data7.hData1.filter(
    //         (item) => !data2.some((xItem) => xItem.id === item.id)
    //       )
    //     : data7.hData1;
    
    const fData1 = data7.hData1 != '' && data2 != '' ? 
          data7.hData1.filter(item => !data2.some(xItem => xItem.id === item.id)) : data7.hData1;

        const fData2 = data7.hData2 != '' && data2 != '' ? 
          data7.hData2.filter(item => !data2.some(xItem => xItem.id === item.id)) : data7.hData2;

        const fData3 = data7.hData3 != '' && data2 != '' ? 
          data7.hData3.filter(item => !data2.some(xItem => xItem.id === item.id)) : data7.hData3;

    // console.log(fData);

    // console.log(data2);
    // console.log(data7.hData2);
    // console.log(pgno, d);

    // console.log(data12[0].link1);

    return res.render("home", {
      title: "Hip Hop | Music | Culture | Podcasts",
      heading: req.cookies.lang == 'en' ? "trending now" : "Tendencia actual",
      id: "",
      ts: "n",
      catData: data,
      showData: data2,
      data8: data8,
      hData4: data6,
      hData1: fData1,
      hData2: fData2,
      hData3: fData3,
      date4: data7.date4,
      currentPage: pgno,
      // next: next,
      // prev: prev,
      auth: authenticated,
      lang: req.lang,
      popup: data10,
      // options: data10[0]?.options,
      ec: req.session.name,
      data12: data12,
      data13: data13,
      data14: data14,
    });
  } 
  catch (error) {
    console.log(error);
  }
});

router.get("/filter", async (req, res, next) => {
  // console.log(req.query);
  try {
    const { ts, id, name } = req.query;

    // const next = req.query.next || false;
    // const prev = req.query.prev || false;

    let pgno = Number(req.query.pgno) || 1;

    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    // const data = await showFirst();
    // console.log(data);

    const response = await axios.request(getData("get/categories.php", "get"));
    const data = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    // const postData = { filter: ts };
    const response2 = await axios.request(
      getData("get/trending.php", "post", { filter: ts })
    );
    const data2 = response2.data;
    
    // const postData8 = { filter: ts };
    const response8 = await axios.request(getData("news/get/trending.php", "post", { filter: ts }));
    const data8 = response8.data;
    
    const today = new Date();

    let data7 = "";

    function padNumber(num) {
      return num.toString().padStart(2, "0");
    }

    // Function to fetch data based on date
    async function fetchData(today, pgno) {
      function formatDate(date) {
        return `${date.getFullYear()}-${padNumber(
          date.getMonth() + 1
        )}-${padNumber(date.getDate())}`;
      }

      // Adjust `today` if `pgno` is provided
      let todayAdjusted = new Date(today).getTime();
      todayAdjusted = new Date(todayAdjusted);

      // Create API request payloads
      const postData2 = { date: formatDate(todayAdjusted) };
      const response3 = await axios.request(
        getData("get/postByDate.php", "post", postData2)
      );
      const data3 = response3.data.slice(0, 10);

      let yesterday = new Date(todayAdjusted).getTime() - 1 * 24 * 3600 * 1000;
      yesterday = new Date(yesterday);
      const postData3 = { date: formatDate(yesterday) };
      const response4 = await axios.request(
        getData("get/postByDate.php", "post", postData3)
      );
      const data4 = response4.data.slice(0, 10);

      let dayBeforeYesterday =
        new Date(todayAdjusted).getTime() - 2 * 24 * 3600 * 1000;
      dayBeforeYesterday = new Date(dayBeforeYesterday);
      const postData4 = { date: formatDate(dayBeforeYesterday) };
      const response5 = await axios.request(
        getData("get/postByDate.php", "post", postData4)
      );
      const data5 = response5.data.slice(0, 10);

      // console.log(todayAdjusted, yesterday, dayBeforeYesterday);
      // Return all fetched data

      return {
        hData1: data3,
        hData2: data4,
        hData3: data5,
        date4: dayBeforeYesterday.toISOString().split("T")[0],
      };
    }

    if (pgno == 1) {
      // console.log("1");
      data7 = await fetchData(today, 0);
    } 
    // else if (pgno >= 1 && next == "true" && prev == "false") {
    //   const x =
    //     new Date(today).getTime() - (Number(pgno) - 1) * (3 * 24 * 3600 * 1000);
    //   // console.log("next", new Date(x));
    //   data7 = await fetchData(x, 0);
    // } else if (pgno >= 1 && prev == "true" && next == "false") {
    //   const x =
    //     new Date(today).getTime() - (Number(pgno) - 1) * (3 * 24 * 3600 * 1000);
    //   // console.log("previous", new Date(x));
    //   data7 = await fetchData(x, 0);
    // } 
    else {
      const x =
        new Date(today).getTime() - (Number(pgno) - 1) * (3 * 24 * 3600 * 1000);
      // console.log(pgno, new Date(x));
      data7 = await fetchData(x, 0);
    }

    const response6 = await axios.request(
      getData("get/featured.php", "post")
    );
    const data6 = response6.data;

    // const response10 = await axios.request(getData("get/latestPoll.php", "get"));
    // const data10 = response10.data;
//     let data11 = '';
    
//     if (data10.length >= 1) {
//       const postData11 = { "pollId": data10[0].id };
//       const response11 = await axios.request(getData("get/getOptions.php", "post", postData11));
//       data11 = response11.data;
//     }

    // console.log(data11);

    // const fData =
    //   data7.hData1 != "" && data2 != ""
    //     ? data7.hData1.filter(
    //         (item) => !data2.some((xItem) => xItem.id === item.id)
    //       )
    //     : data7.hData1;
    
            const fData1 = data7.hData1 != '' && data2 != '' ? 
          data7.hData1.filter(item => !data2.some(xItem => xItem.id === item.id)) : data7.hData1;

        const fData2 = data7.hData2 != '' && data2 != '' ? 
          data7.hData2.filter(item => !data2.some(xItem => xItem.id === item.id)) : data7.hData2;

        const fData3 = data7.hData3 != '' && data2 != '' ? 
          data7.hData3.filter(item => !data2.some(xItem => xItem.id === item.id)) : data7.hData3;

    // console.log(data2);

    // console.log(ts, id, name);

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 1 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 1 }));
    const data14 = response14.data;

    return res.render("home", {
      title: name,
      heading: req.cookies.lang == 'en' ? name : "Tendencia actual",
      id: id,
      ts: ts,
      catData: data,
      showData: data2,
      data8: data8,
      hData4: data6,
      hData1: fData1,
      hData2: fData2,
      hData3: fData3,
      date4: data7.date4,
      currentPage: pgno,
      // next: next,
      // prev: prev,
      auth: authenticated,
      lang: req.lang,
      popup: '',
      // options: '',
      ec: req.session.name,
      data12: [],
      data13: data13,
      data14: data14
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/filter/:id", async (req, res, next) => {
  // console.log(req.params, req.query);
  const { id } = req.params;
  const { name } = req.query;
  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = 24;
  let offset = 0;

  // console.log(id, page);
  // console.log(name);

  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    if (page == 1) {
      offset = 0;
    }
    else {
      offset += itemsPerPage * (page - 1);
    }

    // const data = await showFirst();
    // console.log(data);
    const response = await axios.request(getData("get/categories.php", "get"));
    const data = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    // const postData5 = { cId: id, offset: offset, filter: "n" };
    const response6 = await axios.request(
      getData("get/categories_post.php", "post", { cId: id, offset: offset, filter: "n" })
    );
    const data6 = response6.data?.results;

    const totalCount = response6.data?.totalCount;
    const pageCount = Math.ceil(totalCount / itemsPerPage);
    
    const response12 = await axios.request(getData("get/popDown.php", "get"));
    const data12 = response12.data;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 2 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 2 }));
    const data14 = response14.data;

    // console.log(data13, data14);
    
    // console.log(data6);

    // console.log(name.toLowerCase());

    // console.log(pageCount, totalCount, data6.length);

    return res.render("all", {
      title: name,
      heading: name.toLowerCase(),
      id: id,
      catData: data,
      showData: data6,
      total: totalCount,
      currentPage: page,
      pageCount: pageCount,
      auth: authenticated,
      date: '',
      lang: req.lang,
      data12: data12,
      data13: data13,
      data14: data14,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/news/:id/:nt", async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    const response = await axios.request(getData("get/categories.php", "get"));
    const data1 = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    // console.log(data1);

    // data.append('q2', `select * from posts where id = ${id} limit 10 offset 0`);
    const data = {
      q2: `select * from posts where id = ${id} limit 10 offset 0`,
    };

    const response2 = await axios.request(getData2("post", data));
    const data2 = response2.data;

    // console.log(data2);

    // const postData = { filter: "w" };
    const response3 = await axios.request(
      getData("get/trending.php", "post", { filter: "w" })
    );
    const data3 = response3.data.slice(0, 5);

    // console.log(data3);

    // const postData2 = { postId: id };
    const response4 = await axios.request(
      getData("get/postTags.php", "post", { postId: id })
    );

    const data4 =
      response4.data.length === 1
        ? response4.data
        : response4.data
            .filter(
              (i) =>
                i.name.toLowerCase() !== "featured videos" &&
                i.name.toLowerCase() !== "trending now"
            )
            .reduce((acc, current) => {
              const x = acc.find((item) => item.name === current.name);
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            }, []);

    // console.log(response4.data, data4);

    // console.log(data4);

    // const postData4 = { postId: id };
    const response7 = await axios.request(
      getData("update/views.php", "post", { postId: id })
    );
    // console.log(response7);

    const data5 = {
      q2: `SELECT * FROM views WHERE post_id = ${id} limit 10 offset 0`,
    };
    const response5 = await axios.request(getData2("post", data5));
    const data6 = response5.data;

    // const postData3 = { cId: data4[0].id, offset: 0, filter: "n" };
    const response6 = await axios.request(
      getData("get/categories_post.php", "post", { cId: data4[0].id, offset: 0, filter: "n" })
    );
    const data7 = response6.data;
    const fd = response6.data.results.filter(item => item.id != id);
    
    // console.log(fd);

    const data8 = {
      q2: `select COUNT(*) as comments from comments where post_id = ${id}`,
    };
    const response8 = await axios.request(getData2("post", data8));
    const data9 = response8.data[0]?.comments;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 3 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 3 }));
    const data14 = response14.data;

    const response12 = await axios.request(getData("get/popDown.php", "get"));
    const data12 = response12.data;

    // console.log(data9);

    // console.log(data7);
    // console.log(data4);
    // console.log(id, response6.data);

    return res.render("news", {
      title: "Video",
      heading: "",
      id: id,
      catData: data1,
      showData: data2,
      showTrending: data3,
      tags: data4,
      views: data6[0],
      similar: { totalCount: data7.totalCount, results: fd },
      comments: data9 !== "" ? data9 : 0,
      auth: authenticated,
      lang: req.lang,
      data13: data13,
      data14: data14,
      data12: data12
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/new/:id/:nt", async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;

    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    // const data = await showFirst();
    // console.log(data);
    const response = await axios.request(getData("get/categories.php", "get"));
    const data = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    let today = new Date(id);
    today =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1) +
      "-" +
      today.getDate();
    const postData = { date: today };
    const response2 = await axios.request(
      getData("get/postByDate.php", "post", postData)
    );
    const data2 = response2.data;

    const totalCount = data2.length;
    const pageCount = Math.ceil(totalCount / itemsPerPage);

    // Calculate start and end indices for pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Slice the results array based on pagination
    const paginatedResults = data2.slice(startIndex, endIndex);

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 4 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 4 }));
    const data14 = response14.data;

    // console.log(data4);

    // console.log(data13);

    // console.log(data2.length);

    return res.render("all", {
      title: "all",
      heading: new Date(today),
      id: "",
      catData: data,
      showData: paginatedResults,
      total: data2.length,
      currentPage: page,
      pageCount: pageCount,
      auth: authenticated,
      date: id,
      lang: req.lang,
      data12: [],
      data13: data13,
      data14: data14,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/video/:id/:nt", async (req, res, next) => {
  try {
    const { id, nt } = req.params;
    // console.log(id);

    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    const response = await axios.request(getData("get/categories.php", "get"));
    const data1 = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    const data = {
      q2: `select * from posts where id = ${id} limit 10 offset 0`,
    };

    const response2 = await axios.request(getData2("post", data));
    const data2 = response2.data;

    // console.log(data2);

    const postData = { filter: "w" };
    const response3 = await axios.request(
      getData("get/trending.php", "post", postData)
    );
    const data3 = response3.data.slice(0, 5);

    const postData2 = { postId: id };
    const response4 = await axios.request(
      getData("get/postTags.php", "post", postData2)
    );

    const data4 =
      response4.data.length === 1
        ? response4.data
        : response4.data
            .filter(
              (i) =>
                i.name.toLowerCase() !== "featured videos" &&
                i.name.toLowerCase() !== "trending now"
            )
            .reduce((acc, current) => {
              const x = acc.find((item) => item.name === current.name);
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            }, []);

    const postData4 = { postId: id };
    const response7 = await axios.request(
      getData("update/views.php", "post", postData4)
    );

    const data5 = {
      q2: `SELECT * FROM views WHERE post_id = ${id} limit 10 offset 0`,
    };
    const response5 = await axios.request(getData2("post", data5));
    const data6 = response5.data;

    const data7 = {
      q2: `select COUNT(*) as comments from comments where post_id = ${id}`,
    };
    const response6 = await axios.request(getData2("post", data7));
    const data8 = response6.data[0]?.comments;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 5 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 5 }));
    const data14 = response14.data;

    const response12 = await axios.request(getData("get/popDown.php", "get"));
    const data12 = response12.data;
    
    // urlMapping["featured"] = `/video/${id}`;
    
    // console.log(urlMapping);

    // console.log(data3);

    // console.log(response6.data);

    return res.render("video", {
      title: "Video",
      heading: "",
      id: id,
      catData: data1,
      tags: data4,
      showData: data2,
      views: data6[0],
      showTrending: data3,
      comments: data8 !== "" ? data8 : 0,
      auth: authenticated,
      lang: req.lang,
      data13: data13,
      data14: data14,
      data12: data12
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    // console.log(req.query);
    const { s } = req.query;

    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;

    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    const response = await axios.request(getData("get/categories.php", "get"));
    const data = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    const postData = { s: s };
    const response2 = await axios.request(
      getData("get/search.php", "post", postData)
    );
    const data2 = response2.data;

    const totalCount = data2.length;
    const pageCount = Math.ceil(totalCount / itemsPerPage);

    // Calculate start and end indices for pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Slice the results array based on pagination
    const paginatedResults = data2.slice(startIndex, endIndex);

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 6 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 6 }));
    const data14 = response14.data;

    // console.log(data2);

    return res.render("all", {
      title: "all",
      heading: s,
      id: "",
      catData: data,
      showData: paginatedResults,
      total: data2.length,
      currentPage: page,
      pageCount: 0,
      auth: authenticated,
      lang: req.lang,
      data12: [],
      data13: data13,
      data14: data14
    });
  } 
  catch (error) {
    console.log(error);
  }
});

router.get("/comments/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { n, t, d } = req.query;
    // console.log(id);

    const postData = { postId: id, offset: 0 };
    const response = await axios.request(
      getData("get/comments.php", "post", postData)
    );
    const data = response.data.results;

    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    // console.log(data);

    return res.render("comment", {
      title: "comments",
      comments: data,
      id: id,
      reply: "",
      count: data.length,
      auth: authenticated,
      usa: response.data.usaTimestamp,
      n,
      t,
      d,
      lang: req.lang,
    });
  } catch (error) {
    console.log("show comments:", error);
  }
});

router.post("/addPost", isAuth, async (req, res, next) => {
  try {
    const { id, n, t, d } = req.body;

    const comment = req.body.comment.trim();

    // console.log(comment, id, uid);

    if (req.cookies._prod_token === req.user?.rem_token) {
      let data = JSON.stringify({
        userId: req.user.id,
        postId: id,
        text: comment,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: baseUrl + "insert/comment.php",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios.request(config);
      const data2 = response.data;

      // console.log(data2);

      return res.redirect(`/comments/${id}?n=${n}&t=${t}&d=${d}`);
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.log("post comment...", error);
  }
});

router.post("/addReply", isAuth, async (req, res, next) => {
  try {
    const { id, cid, n, t, d } = req.body;
    
    // console.log(req.body);

    const reply = req.body.reply.trim();

    // console.log(reply, id, cid);

    if (req.cookies._prod_token === req.user?.rem_token) {
      let data = JSON.stringify({
        userId: req.user.id,
        commId: cid,
        text: reply,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: baseUrl + "insert/reply.php",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios.request(config);
      const data2 = response.data;

      // console.log(data2);

      return res.redirect(`/comments/${id}?n=${n}&t=${t}&d=${d}`);
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.log("post comment...", error);
  }
});

router.get("/blog", async (req, res, next) => {
  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;
    
    const response = await axios.request(getData("news/get/categories.php", "get"));
    const data = response.data;

    // console.log(data)

    const postData2 = { cId: 8, offset: 0, filter: "n" };
    const response2 = await axios.request(getData("news/get/categories_post.php", "post", postData2));
    const data2 = response2.data?.results;

    // console.log(data2.length);

    const postData3 = { filter: 'n' };
    const response3 = await axios.request(getData("news/get/trending.php", "post", postData3));
    const data3 = response3.data;

    // console.log(data3);

    const response6 = await axios.request(getData("news/get/featured.php", "post"));
    const data6 = response6.data;

    // console.log(data6);
    
    const fData1 = data2 != '' && data3 != '' ? 
          data2.filter(item => !data3.some(xItem => xItem.id === item.id)) : data2;
    
    const totalCount = Math.ceil(Number(response2.data?.totalCount)/Number(data2.length));

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 7 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 7 }));
    const data14 = response14.data;
    
    // console.log(fData1.length, totalCount);

    return res.render("blog", {
      title: "HipHop News",
      heading: "trending now",
      id: "",
      ts: "n",
      catData: data,
      auth: authenticated,
      entertainment: fData1,
      showData: data3,
      featured: data6,
      totalCount,
      lang: req.lang,
      data13: data13,
      data14: data14
    })
  }

  catch(error) {
    console.log(error);
  }
})

router.get("/newsFilter", async (req, res, next) => {
  // console.log(req.query);
  try {
    const { ts } = req.query;

    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    const response = await axios.request(getData("news/get/categories.php", "get"));
    const data = response.data;

    const postData2 = { cId: 8, offset: 0, filter: "n" };
    const response2 = await axios.request(getData("news/get/cat_post.php", "post", postData2));
    const data2 = response2.data.results;

    // console.log(data2);

    const postData3 = { filter: ts };
    const response3 = await axios.request(getData("news/get/trending.php", "post", postData3));
    const data3 = response3.data;

    // console.log(data3);

    const response6 = await axios.request(getData("news/get/featured.php", "post"));
    const data6 = response6.data;

    // console.log(data6);
    
    const fData1 = data2 != '' && data3 != '' ? 
          data2.filter(item => !data3.some(xItem => xItem.id === item.id)) : data2;
    
    const totalCount = Math.ceil(Number(response2.data?.totalCount)/Number(data2.length));

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 8 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 8 }));
    const data14 = response14.data;

    return res.render("blog", {
      title: "HipHop News",
      heading: "trending news",
      id: "",
      ts: ts,
      catData: data,
      auth: authenticated,
      entertainment: fData1,
      showData: data3,
      featured: data6,
      totalCount,
      lang: req.lang,
      data13: data13,
      data14: data14
    })
  } 
  
  catch (error) {
    console.log(error);
  }
});

router.get("/blogNews/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = parseInt(req.query.pgno) || 1;
    let tc = Number(req.query.tc);
    const { t } = req.query;

    let offset = page == 1 ? 0 : tc * (page-1);

    // console.log(id, offset, page);
    
    // console.log(tc);

    const authenticated = req.session.isLoggedIn == "false" ? false : true;
    
    const response = await axios.request(getData("news/get/categories.php", "get"));
    const data = response.data;

    // console.log(data);

    let data2 = new FormData();
    data2.append('q2', `select name from category where id = ${id} limit 10 offset 0`);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.hiphopboombox.com/app/api/connection/newsQuery.php',
      headers: { 
        ...data2.getHeaders()
      },
      data : data2
    };

    const response1 = await axios.request(config);
    const data1 = response1.data;

    // console.log(data1);

    const postData3 = { filter: 'w' };
    const response3 = await axios.request(getData("news/get/trending.php", "post", postData3));
    const data3 = response3.data.slice(0, 5);

    // console.log(data3);

    const postData4 = { cId: id, offset: offset, filter: "n" };
    const response4 = await axios.request(getData("news/get/categories_post.php", "post", postData4));
    const data4 = response4.data;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 9 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 9 }));
    const data14 = response14.data;

    // console.log(data4);

    return res.render("blog_post", {
      title: "Blog News",
      id: id,
      heading: data1[0].name,
      catData: data,
      auth: authenticated,
      trending: data3,
      nextPart: data4.results,
      totalCount: data4.totalCount,
      cp: page || 1,
      t: t,
      lang: req.lang,
      data13: data13,
      data14: data14
    })
  }

  catch(error) {
    console.log(error);
  }
})

router.get("/blogNews2/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.pgno) || 1;
    let tc = Number(req.query.tc);
    const { t } = req.query;

    const itemsPerPage = 10;

    // console.log(id, page, next, prev);

    const authenticated = req.session.isLoggedIn == "false" ? false : true;
    
    const response = await axios.request(getData("news/get/categories.php", "get"));
    const data = response.data;

    // console.log(data);

    const postData3 = { filter: 'w' };
    const response3 = await axios.request(getData("news/get/trending.php", "post", postData3));
    const data3 = response3.data.slice(0, 5);

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 10 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 10 }));
    const data14 = response14.data;


    if (id == 'd') {
      let today = new Date();
      today = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()-1}`;

      // console.log(today);

      const postData5 = { 'date': today };
      const response5 = await axios.request(getData("news/get/postByDate.php", "post", postData5));
      const data5 = response5.data;

      // console.log(data5);

      const totalCount = data5.length;
      const pageCount = Math.ceil(totalCount / itemsPerPage);

      // Calculate start and end indices for pagination
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      // Slice the results array based on pagination
      const paginatedResults = data5.slice(startIndex, endIndex);

      return res.render("blog_post", {
        title: "Blog News",
        id: 'd',
        heading: 'Popular',
        catData: data,
        auth: authenticated,
        trending: data3,
        nextPart: paginatedResults,
        totalCount: pageCount,
        cp: page,
        t,
        lang: req.lang,
        data13: data13,
        data14: data14
      })
    }

    else {
      const postData6 = { filter: 'w' };
      const response6 = await axios.request(getData("news/get/trending.php", "post", postData6));
      const data6 = response6.data;

      // console.log(data6);

      const totalCount = data6.length;
      const pageCount = Math.ceil(totalCount / itemsPerPage);

      // Calculate start and end indices for pagination
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      // Slice the results array based on pagination
      const paginatedResults = data6.slice(startIndex, endIndex);

      return res.render("blog_post", {
        title: "Blog News",
        id: 't',
        heading: 'Latest',
        catData: data,
        auth: authenticated,
        trending: [],
        nextPart: paginatedResults,
        totalCount: pageCount,
        cp: page,
        t,
        data13: data13,
        data14: data14
      })
    }
  }

  catch(error) {
    console.log(error);
  }
})

router.get("/blogData/:id/:nt", async (req, res, next) => {
  try {
    const { id } = req.params;

    // console.log(id);

    const authenticated = req.session.isLoggedIn == "false" ? false : true;
    
    const response = await axios.request(getData("news/get/categories.php", "get"));
    const data = response.data;

    let data2 = new FormData();
    data2.append('q2', `select * from posts where id = ${id} limit 10 offset 0`);

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.hiphopboombox.com/app/api/connection/newsQuery.php',
      headers: { 
        ...data2.getHeaders()
      },
      data : data2
    };

    const response2 = await axios.request(config);
    const data3 = response2.data;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 11 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 11 }));
    const data14 = response14.data;

    // console.log(data3);

    return res.render("x", {
      title: "Blog",
      catData: data,
      auth: authenticated,
      post: data3,
      lang: req.lang,
      data13: data13,
      data14: data14
    })
  }

  catch(error) {
    console.log(error);
  }
})

router.post("/poll", isAuth, async (req, res, next) => {
  try {
    // console.log(req.body);
    const { id1, id2, title } = req.body;

    if (id1 != 0) {
      const postData = { "poll_id": id1, "option_id": id2 };
      const response4 = await axios.request(getData("update/votes.php", "post", postData));

      // return res.redirect(`/poll/?id1=${id1}&id2=${id2}`);
      return res.redirect(`/poll/${id1}/${id2}/${title}`);
    }

    else if (id1 == 0) {
      // return res.redirect(`/poll/?id1=${id1}&id2=${id2}`);
      return res.redirect(`/poll/${id1}/${id2}/${title}`);
    }

    else {
      return res.redirect("/");
    }
  }

  catch(error) {
    console.log("Voting/Poll get error", error)
  }
})

router.get("/poll/:id1/:id2/:title", async (req, res, next) => {
  try {
    const { id1, id2, title } = req.params;
    
    // console.log(id1, id2);

    const authenticated = req.session.isLoggedIn == "false" ? false : true;
    
    // console.log(authenticated);

    const response = await axios.request(getData("get/categories.php", "get"));
    const data1 = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    const modalShown = req.cookies.showModal;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 12 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 12 }));
    const data14 = response14.data;

    // console.log(req.query, modalShown);

    if (id1 != 0 && id2 != 0 && modalShown) {
      const postData2 = { "id": id1 };
      const response2 = await axios.request(getData("get/pollById.php", "post", postData2));
      const data2 = response2.data;
      
      // console.log(data2);

      const postData3 = { "pollId": id1 };
      const response3 = await axios.request(getData("get/getVote.php", "post", postData3));
      const data3 = response3.data;
      
      const showData = [{ 
        title: data2[0].question, 
        image: data2[0].landscape_img, 
        url: `https://heathered-well-father.glitch.me/poll/${id1}/${id2}/${title}` 
      }];
      
      // console.log(showData);

      // console.log(data2, data3);

      return res.render("poll", {
        title: "Poll",
        auth: authenticated,
        lang: req.lang,
        catData: data1,
        data: data2[0],
        votes: data3,
        showData: showData,
        data13: data13,
        data14: data14
      })
    }

    else {
      const response2 = await axios.request(getData("get/latestPoll.php", "get"));
      const data2 = response2.data;

      // console.log(data2);

      if (data2 == '') {
        return res.redirect("/");
      }

      else {
        const postData3 = { "pollId": data2[0]?.question.id };
        const response3 = await axios.request(getData("get/getVote.php", "post", postData3));
        const data3 = response3.data;
        
        // console.log(data3, data2[0].question.landscape_img);
        
        const showData = [{ 
          title: data2[0]?.question.question, 
          image: data2[0]?.question.landscape_img, 
          url: `https://heathered-well-father.glitch.me/poll/${id1}/${id2}/${title}` 
        }];
        
        // console.log(data2, showData);

        return res.render("poll", {
          title: "Poll",
          auth: authenticated,
          lang: req.lang,
          catData: data1,
          data: data2[0]?.question,
          votes: data3,
          showData: showData,
          data13: data13,
          data14: data14
        })
      }
    }

    // else {
    //   return res.redirect("/");
    // }    
  }

  catch(error) {
    console.log("Voting/Poll post error", error)
  }
})

router.get("/terms", async (req, res, next) => {
  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    const response = await axios.request(getData("get/categories.php", "get"));
    const data1 = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    const response2 = await axios.request(getData("get/footer_terms.php", "get"));
    const data2 = response2.data;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 13 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 13 }));
    const data14 = response14.data;

    // console.log(data2);

    return res.render("terms", {
      title: "terms of service",
      auth: authenticated,
      lang: req.lang,
      catData: data1,
      data: data2[0],
      data13: data13,
      data14: data14
    })
  }

  catch(error) {
    console.log("Footer terms of service error", error);
  }
})

router.get("/privacy", async (req, res, next) => {
  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    const response = await axios.request(getData("get/categories.php", "get"));
    const data1 = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    const response2 = await axios.request(getData("get/footer_privacy.php", "get"));
    const data2 = response2.data;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 14 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 14 }));
    const data14 = response14.data;

    // console.log(data2);

    return res.render("privacy", {
      title: "privacy",
      auth: authenticated,
      lang: req.lang,
      catData: data1,
      data: data2[0],
      data13: data13,
      data14: data14
    })
  }

  catch(error) {
    console.log("Footer terms of service error", error);
  }
})

router.get("/dmca", async (req, res, next) => {
  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    const response = await axios.request(getData("get/categories.php", "get"));
    const data1 = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    const response2 = await axios.request(getData("get/footer_dmca.php", "get"));
    const data2 = response2.data;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 15 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 15 }));
    const data14 = response14.data;

    // console.log(data2);

    return res.render("dmca", {
      title: "dmca",
      auth: authenticated,
      lang: req.lang,
      catData: data1,
      data: data2[0],
      data13: data13,
      data14: data14
    })
  }

  catch(error) {
    console.log("Footer terms of service error", error);
  }
})

router.get("/eula", async (req, res, next) => {
  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    const response = await axios.request(getData("get/categories.php", "get"));
    const data1 = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    const response2 = await axios.request(getData("get/footer_eula.php", "get"));
    const data2 = response2.data;

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 16 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 16 }));
    const data14 = response14.data;

    // console.log(data2);

    return res.render("eula", {
      title: "EULA",
      auth: authenticated,
      lang: req.lang,
      catData: data1,
      data: data2[0],
      data13: data13,
      data14: data14
    })
  }

  catch(error) {
    console.log("Footer EULA error", error);
  }
})

router.get("/raffle", async (req, res, next) => {
  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    const response = await axios.request(getData("get/categories.php", "get"));
    const data1 = response.data.filter(
      (i) =>
        i.name.toLowerCase() !== "trending now" &&
        i.name.toLowerCase() !== "featured videos" &&
        i.name.toUpperCase() !== "FUNMESOCIAL" &&
        i.name !== ""
    );

    const response13 = await axios.request(getData("get/getPageAdsById.php", "post", 
      { 'page_id': 17 }));
    const data13 = response13.data;

    const response14 = await axios.request(getData("get/getMobileAdsById.php", "post", 
      { 'page_id': 17 }));
    const data14 = response14.data;

    // console.log(data2);

    return res.render("raffle", {
      title: "Raffle T&C",
      auth: authenticated,
      lang: req.lang,
      catData: data1,
      data: "Raffle Terms and Conditions",
      data13: data13,
      data14: data14
    })
  }

  catch(error) {
    console.log("Footer RAFFLE error", error);
  }
})

router.get("/settings", isAuth, async (req, res, next) => {
  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;
    
    // const id = req.user.id;
    // console.log(id);
    
    return res.render("settings", {
      title: "Settings",
      auth: authenticated,
      lang: req.lang
    })
  }
  
  catch(error) {
    console.log("Setting page error...", error);
  }
})

router.post("/settings", isAuth, async (req, res, next) => {
  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;
    
    const id = req.user.id;
    // console.log(id);
    
    const postData = { "id": id };
    const response = await axios.request(getData("delete/user.php", "post", postData));
    const data2 = response.data;
    
    // console.log(data2);
    
    if (data2.isSuccess == true) {
      const postData2 = {
        q1: `DELETE from hSession where email = '${req.session.name}'`,
      };
      const response2 = await axios.request(selectUrl("post", postData2));

      req.session.destroy((err) => {
        // console.log(err);
        res.clearCookie("_prod_isLoggedIn");
        res.clearCookie("_prod_email");
        res.clearCookie("_prod_sessionId");
        res.clearCookie("_prod_token");
        res.clearCookie("lang");
        // res.clearCookie("showModal");
        return res.redirect("/");
      });
    }
    
    else return res.redirect("/settings");
  }
  
  catch(error) {
    console.log("Setting post page error...", error);
    return res.redirect("/settings");
  }
})

// add from here

router.get("/payments", async (req, res, next) => {
  try {
    const { uId, g, rId } = req.query;
    const size = Number(req.query.s);
    // console.log(m, size, g, typeof size);
    
    let message = req.flash('error');
    // console.log(message);

    if (message.length > 0) {
      message = message[0];
    }

    else {
      message = null;
    }
    
    const data = {
      q2: `select * from users where id = '${uId}' limit 10 offset 0`,
    };

    const response2 = await axios.request(selectUrl("post", data));
    const data2 = response2.data;
    
    // console.log(data2.length >= 1);
    
    if (data2.length >= 1 && size && g) {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.nowpayments.io/v1/full-currencies',
        headers: { 
          'x-api-key': 'RYPBGR8-Z9VM71T-JWBW54V-A0W1PWA'
        }
      };

      const response = await axios.request(config);
      // console.log(response.data);

      // console.log(JSON.stringify(response.data));

      let k = response.data;
          // console.log(k);
      

      if (k.currencies.length >= 1) {
            const getCurrency = k.currencies.filter(i => {
              if(i.code.toUpperCase() == 'LTC' || i.code.toUpperCase() == 'USDTTRC20' 
                  || i.code.toUpperCase() == 'ETH'
                  || i.code.toUpperCase() == 'DGB' || i.code.toUpperCase() == 'GAS' 
                  || i.code.toUpperCase() == 'XLM' || i.code.toUpperCase() == 'XRP'
                  || i.code.toUpperCase() == 'DASH'  || i.code.toUpperCase() == 'NEAR'
                  || i.code.toUpperCase() == 'TRX' || i.code.toUpperCase() == 'EOS'
                  || i.code.toUpperCase() == 'XMR' || i.code.toUpperCase() == 'BCH' || i.code.toUpperCase() == 'ZEN'
                  || i.code.toUpperCase() == 'XVG' || i.code.toUpperCase() == 'TUSD'
                  || i.code.toUpperCase() == 'QTUM' || i.code.toUpperCase() == 'FUN' || i.code.toUpperCase() == 'BTG'
              ) {
                  return true;
              }
            }).map(j => { return { code: j.code, name: j.name, imgUrl: j.logo_url } }); 
        
          // console.log(getCurrency);

            return res.render("payment", {
              title: "Payment",
              errorMessage: message,
              auth: false,
              lang: req.lang,
              currency: getCurrency,
              uId: uId,
              rId: rId,
              size: size,
              gender: g,
            })
      }

      else {
        // console.log("1");
        return res.redirect("/");
      } 
    }
    
    else {
      // console.log("2");
      return res.redirect("/");
    } 
  }
  
  catch (error) {
    console.log("error", error);
    return res.redirect("/");
  }
})

router.post("/pay", 
	[
		body('currency')
	  	.trim()
	  	.notEmpty()
	  	.withMessage("Payment mode required...")
	  	.isIn(['ETH', 'DGB', 'GAS', 'LTC', 'XLM', 'XRP', 'DASH', 'TRX', 'EOS', 'XMR', 
             'BCH', 'ZEN', 'XVG', 'TUSD', 'QTUM', 'FUN', 'BTG', 'BCD', 'BAT', 'USDTTRC20', 'NEAR'])
    	.withMessage('Invalid Payment Mode'),
    body("uId")
      .trim()
      .notEmpty()
      .withMessage("User Id required")
      .isNumeric()
      .withMessage("Invalid user id"),
    body("rId")
      .trim()
      .notEmpty()
      .withMessage("Raffel Id required")
      .isNumeric()
      .withMessage("Invalid Raffel id"),
    body("size")
      .trim()
      .notEmpty()
      .withMessage("Size required")
      .isNumeric()
      .withMessage("Invalid size"),
    body('gender')
	  	.trim()
	  	.notEmpty()
	  	.withMessage("Gender required...")
	  	.isIn(['Men', 'Women', 'Children'])
    	.withMessage('Invalid gender'),
	],
	async (req, res, next) => {
    const { uId, rId, size, gender, currency } = req.body;
  
    try {
      // const currency = req.body.currency;

      // console.log(uId, rId, size, gender, currency);
      
      const error = validationResult(req);

      if (!error.isEmpty()) {
        // console.log(error.array());
        let msg1 = error.array()[0].msg;
        
        // console.log(msg1);
        // https://api.hiphopboombox.com/cryptoAPI/b.php
        
        req.flash("error", "Something went wrong... Change Crypto....");
        return res.redirect(`/payments?uId=${uId}&rId=${rId}&s=${size}&g=${gender}`);
      }
      
      else {
        // const notificationsKey = process.env.IPN.toString();
        // const notificationsKey = "Tq4cHJfSWIZs6K3p6faPJXXO6aKE9OGp";
        
        let data = JSON.stringify({
          "uId": uId,
          "rId": rId,
          "total": 11.00,
          "currency": currency,
          "size": size,
          "gender": gender
        });

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://api.hiphopboombox.com/cryptoAPI/getPayAddress.php',
          headers: {  
            'Content-Type': 'application/json'
          },
          data : data
        };
        
        const response = await axios.request(config);
        
        // console.log(response.data);
                
        let z = response.data;

				// console.log("hii", z);
        // console.log(z.code);

				if (z.isSuccess == false && z.payment_id == '') {
				  req.flash("error", "Change Crypto....");
          return res.redirect(`/payments?uId=${z.uId}&rId=${z.rId}&s=${z.size}&g=${z.gender}`);
				}

				else if (z.isSuccess == true && z.payment_id != '') {
          return res.redirect(`/qr?id=${z?.payment_id}&uId=${z.uId}&rId=${z.rId}&s=${z.size}&g=${z.gender}`);
        }
      }
    }
  
    catch(error) {
      // console.log("error", error);
      // if (error.response.data.hasOwnProperty('code') && error.response.data.code === 'AMOUNT_MINIMAL_ERROR') {
      //   req.flash("error", "Change Crypto....");
      //   return res.redirect(`/payments?uId=${uId}&rId=${rId}&s=${size}&g=${gender}`);
      // }
      // else 
      return res.redirect("/");
    }
  }
);

router.get("/qr", async (req, res, next) => {
  try {
    const { id, uId, rId, s, g } = req.query;
    
    // console.log(id, s, g);
    
    const data = {
      q2: `select * from users where id = '${uId}' limit 10 offset 0`,
    };

    const response2 = await axios.request(selectUrl("post", data));
    const data2 = response2.data;
    
    if (data2.length >= 1) {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.nowpayments.io/v1/payment/${id}`,
        headers: { 
          'x-api-key': 'RYPBGR8-Z9VM71T-JWBW54V-A0W1PWA'
        }
      };
      
      // let config = {
      //   method: 'get',
      //   maxBodyLength: Infinity,
      //   url: `https://api-sandbox.nowpayments.io/v1/payment/${id}`,
      //   headers: { 
      //     'x-api-key': 'HSK1JGA-W6BM4Z6-GQVJBCH-7FH7R3R'
      //   }
      // };

      const response = await axios.request(config);
      // console.log(response.data);
      
      const z = response.data;
      
      // console.log(z);
      
      QRCode.toDataURL(z?.pay_address, async function (err, url) {
					if (err) {
						// Handle any errors that may occur when generating the QR code
					  console.error(err);
						return res.redirect(`/payments?uId=${uId}&rId=${rId}&s=${s}&g=${g}`);
					} 
					else {
            const postData2 = {
              q1: `insert into raffle_user (user_id, raffle_id, payment_id, status) values ('${uId}', '${rId}', '${z?.payment_id}', '${z?.payment_status}')`,
            };
            const response3 = await axios.request(selectUrl("post", postData2));
            
            // console.log(response3);
            
						return res.render('cryptoQR', {
	            title: "PAYNOW",
              lang: req.lang,
	            address: z.pay_address,
	            amount: z.pay_amount,
	            currency: z.pay_currency,
	            cAmt: z.price_amount,
	            iSrc: url
	          });
					}
				})
    }
    
    else {
      // console.log("2");
      return res.redirect("/");
    }
  }
  
  catch (error) {
    console.log("error", error);
    return res.redirect("/");
  }
})

router.get("/music", async (req, res, next) => {
  try {
    const authenticated = req.session.isLoggedIn == "false" ? false : true;

    return res.render("music", {
      title: "Music",
      heading: "",
      catData: [{ id: 1, name: 'Single' }, { id: 2, name: 'Album' }],
      auth: authenticated,
      lang: req.lang,
      data12: [],
      data13: [],
      data14: [],
      page: 1,
      totalCount: 1,
      showData: ['abcd']
    });
  }

  catch(error) {
    console.log("get music error: ", error);
  }
})

module.exports = router;
