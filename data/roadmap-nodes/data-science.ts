import type { RoadmapNodeInfo } from "./cyber-security";

export const dataScienceNodes: RoadmapNodeInfo[] = [
  {
    id: "statistics",
    label: "Statistics & Probability",
    description: "Mean, median, standard deviation, probability distributions, hypothesis testing, and p-values. You can't interpret data without statistics — it's the language data scientists speak.",
    status: "required",
    resources: {
      youtube: { title: "Statistics Full Course – StatQuest", url: "https://www.youtube.com/c/joshstarmer", provider: "StatQuest with Josh Starmer", tags: ["Free", "Recommended"] },
      course: { title: "Statistics with Python Specialization – University of Michigan", url: "https://www.coursera.org/specializations/statistics-with-python", provider: "Coursera", tags: ["Free Audit"], duration: "3 months" },
      book: { title: "Practical Statistics for Data Scientists", url: "https://www.oreilly.com/library/view/practical-statistics-for/9781492072935/", provider: "O'Reilly", tags: ["Recommended"] },
      docs: { title: "Khan Academy – Statistics and Probability", url: "https://www.khanacademy.org/math/statistics-probability", tags: ["Free"] },
    },
  },
  {
    id: "python-data",
    label: "Python for Data",
    description: "Pandas for data manipulation, NumPy for numerical computing, and Jupyter notebooks for interactive analysis. These three tools are in every data scientist's daily workflow.",
    status: "required",
    resources: {
      youtube: { title: "Pandas Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=vmEHCJofslg", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "IBM Data Science Professional Certificate", url: "https://www.coursera.org/professional-certificates/ibm-data-science", provider: "Coursera / IBM", tags: ["Free Audit", "Recommended"], duration: "10 months" },
      book: { title: "Python for Data Analysis", url: "https://wesmckinney.com/book/", provider: "Wes McKinney (Pandas creator)", tags: ["Free", "Official"] },
      docs: { title: "Pandas Documentation", url: "https://pandas.pydata.org/docs/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "sql-data-science",
    label: "SQL for Data",
    description: "SELECT, JOIN, GROUP BY, window functions, CTEs, and query optimization. SQL is how data scientists extract insights from databases — it's used daily in every data role.",
    status: "required",
    resources: {
      youtube: { title: "SQL Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "Google Data Analytics Certificate", url: "https://grow.google/certificates/data-analytics/", provider: "Google / Coursera", tags: ["Free Audit", "Recommended"], duration: "6 months" },
      book: { title: "Learning SQL", url: "https://www.oreilly.com/library/view/learning-sql-3rd/9781492057604/", provider: "O'Reilly", tags: ["Recommended"] },
      docs: { title: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", tags: ["Free"] },
    },
  },
  {
    id: "data-visualization",
    label: "Data Visualization",
    description: "Matplotlib, Seaborn, and Plotly for Python charts. Tableau and Power BI for business dashboards. Clear visualization is how you turn analysis into decisions others can act on.",
    status: "required",
    resources: {
      youtube: { title: "Matplotlib & Seaborn – freeCodeCamp", url: "https://www.youtube.com/watch?v=UO98lJQ3QGI", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "2h" },
      course: { title: "Data Visualization with Tableau – UC Davis", url: "https://www.coursera.org/specializations/data-visualization", provider: "Coursera", tags: ["Free Audit"], duration: "5 months" },
      book: { title: "Storytelling with Data", url: "https://www.storytellingwithdata.com/books", provider: "Cole Nussbaumer Knaflic", tags: ["Recommended"] },
      docs: { title: "Plotly Python Docs", url: "https://plotly.com/python/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "machine-learning-ds",
    label: "Machine Learning",
    description: "Scikit-learn, regression, classification, clustering, model evaluation, and feature engineering. Data scientists use ML to build predictive models that drive business decisions.",
    status: "important",
    resources: {
      youtube: { title: "Machine Learning Crash Course – Google", url: "https://developers.google.com/machine-learning/crash-course", provider: "Google", tags: ["Free", "Official"], duration: "15h" },
      course: { title: "Machine Learning Specialization – Andrew Ng", url: "https://www.coursera.org/specializations/machine-learning-introduction", provider: "Coursera", tags: ["Free Audit", "Recommended"], duration: "3 months" },
      book: { title: "Hands-On ML with Scikit-Learn and TensorFlow", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/", provider: "O'Reilly", tags: ["Recommended"] },
      docs: { title: "Scikit-learn Tutorials", url: "https://scikit-learn.org/stable/tutorial/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "data-engineering",
    label: "Data Engineering Basics",
    description: "ETL pipelines, Apache Spark, data warehouses (BigQuery, Snowflake, Redshift), and Airflow for orchestration. Data engineers build the pipelines that data scientists depend on.",
    status: "important",
    resources: {
      youtube: { title: "Data Engineering Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=ysz5S6PUM-U", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "5h" },
      course: { title: "IBM Data Engineering Professional Certificate", url: "https://www.coursera.org/professional-certificates/ibm-data-engineer", provider: "Coursera / IBM", tags: ["Free Audit"], duration: "8 months" },
      docs: { title: "Apache Spark Documentation", url: "https://spark.apache.org/docs/latest/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "bi-tools",
    label: "Business Intelligence",
    description: "Power BI, Tableau, and Looker for building executive dashboards. Understanding business KPIs and how to communicate insights to non-technical stakeholders.",
    status: "optional",
    resources: {
      youtube: { title: "Power BI Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=NNSHu0rkew8", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "6h" },
      course: { title: "Business Intelligence and Data Warehousing – UC Davis", url: "https://www.coursera.org/learn/business-intelligence-tools", provider: "Coursera", tags: ["Free Audit"], duration: "4 weeks" },
      docs: { title: "Microsoft Power BI Docs", url: "https://learn.microsoft.com/en-us/power-bi/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "data-science-portfolio",
    label: "Portfolio & Kaggle",
    description: "Build a portfolio of real projects on GitHub. Compete on Kaggle to sharpen your skills and benchmark yourself against the world. A strong portfolio beats a degree in data science hiring.",
    status: "optional",
    resources: {
      youtube: { title: "How to Build a Data Science Portfolio – Ken Jee", url: "https://www.youtube.com/watch?v=1aXk2RViq3c", provider: "Ken Jee", tags: ["Free", "Recommended"], duration: "15m" },
      course: { title: "Kaggle Learn – Free Micro-Courses", url: "https://www.kaggle.com/learn", provider: "Kaggle", tags: ["Free", "Hands-on"] },
      docs: { title: "Kaggle Competitions", url: "https://www.kaggle.com/competitions", tags: ["Free"] },
    },
  },
];
