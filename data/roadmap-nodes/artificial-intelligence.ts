import type { RoadmapNodeInfo } from "./cyber-security";

export const artificialIntelligenceNodes: RoadmapNodeInfo[] = [
  {
    id: "setup",
    label: "Setup & Prerequisites",
    description: "Before your first model: install a code editor, install Python, get a real AI notebook running (Google Colab or Anaconda), and create free accounts on Kaggle and Hugging Face. Step-by-step — ready for everything else in this roadmap.",
    status: "required",
    resources: {
      youtube: { title: "Google Colab Tutorial for Beginners", url: "https://www.youtube.com/watch?v=RLYoEyIHL6A", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "12m" },
      course: { title: "Google Colab", url: "https://colab.research.google.com/", provider: "Google", tags: ["Free", "Official"] },
      docs: { title: "Download Visual Studio Code", url: "https://code.visualstudio.com/download", tags: ["Free", "Official"] },
    },
  },
  {
    id: "python-for-ai",
    label: "Python for AI",
    description: "Python is the language of AI. NumPy for arrays, Pandas for data, Matplotlib for visualization, and Jupyter notebooks for experimentation. You cannot do AI without Python.",
    status: "required",
    resources: {
      youtube: { title: "Python for Data Science – freeCodeCamp", url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "12h" },
      course: { title: "Python for Everybody – University of Michigan", url: "https://www.coursera.org/specializations/python", provider: "Coursera", tags: ["Free Audit", "Recommended"], duration: "3 months" },
      book: { title: "Automate the Boring Stuff with Python", url: "https://automatetheboringstuff.com", provider: "Al Sweigart", tags: ["Free", "Recommended"] },
      docs: { title: "NumPy Official Docs", url: "https://numpy.org/doc/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "math-for-ml",
    label: "Math for ML",
    description: "Linear algebra (matrices, vectors, eigenvalues), statistics (probability, distributions, Bayes), and calculus (derivatives, gradients). You don't need a PhD — you need intuition for these concepts.",
    status: "required",
    resources: {
      youtube: { title: "Linear Algebra – 3Blue1Brown", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", provider: "3Blue1Brown", tags: ["Free", "Recommended"] },
      course: { title: "Mathematics for Machine Learning – Imperial College", url: "https://www.coursera.org/specializations/mathematics-machine-learning", provider: "Coursera", tags: ["Free Audit"], duration: "4 months" },
      book: { title: "Mathematics for Machine Learning", url: "https://mml-book.github.io", provider: "Deisenroth et al.", tags: ["Free", "Recommended"] },
      docs: { title: "Khan Academy – Linear Algebra", url: "https://www.khanacademy.org/math/linear-algebra", tags: ["Free"] },
    },
  },
  {
    id: "machine-learning",
    label: "Machine Learning",
    description: "Supervised learning (regression, classification), unsupervised learning (clustering), model evaluation, overfitting, cross-validation, and Scikit-learn. This is the core of AI.",
    status: "required",
    resources: {
      youtube: { title: "Machine Learning Course – Stanford / Andrew Ng", url: "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU", provider: "Stanford", tags: ["Free", "Recommended"] },
      course: { title: "Machine Learning Specialization – Andrew Ng", url: "https://www.coursera.org/specializations/machine-learning-introduction", provider: "Coursera", tags: ["Free Audit", "Recommended"], duration: "3 months" },
      book: { title: "Hands-On Machine Learning with Scikit-Learn and TensorFlow", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/", provider: "O'Reilly", tags: ["Recommended"] },
      docs: { title: "Scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "deep-learning",
    label: "Deep Learning",
    description: "Neural networks, backpropagation, CNNs, RNNs, and transformers. Implement in PyTorch or TensorFlow. Deep learning powers image recognition, NLP, and generative AI.",
    status: "required",
    resources: {
      youtube: { title: "Deep Learning Crash Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=VyWAvY2CF9c", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "2h" },
      course: { title: "Deep Learning Specialization – Andrew Ng", url: "https://www.coursera.org/specializations/deep-learning", provider: "Coursera", tags: ["Free Audit", "Recommended"], duration: "5 months" },
      book: { title: "Deep Learning", url: "https://www.deeplearningbook.org", provider: "Goodfellow, Bengio, Courville", tags: ["Free", "Recommended"] },
      docs: { title: "PyTorch Official Docs", url: "https://pytorch.org/docs/stable/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "nlp",
    label: "NLP & LLMs",
    description: "Natural Language Processing: tokenization, embeddings, transformers (BERT, GPT), fine-tuning, and working with LLM APIs (OpenAI, Anthropic, Hugging Face). The most in-demand AI skill in 2024.",
    status: "important",
    resources: {
      youtube: { title: "NLP with Hugging Face – freeCodeCamp", url: "https://www.youtube.com/watch?v=00GKzGyWFEs", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "5h" },
      course: { title: "Natural Language Processing Specialization", url: "https://www.coursera.org/specializations/natural-language-processing", provider: "Coursera / deeplearning.ai", tags: ["Free Audit"], duration: "4 months" },
      docs: { title: "Hugging Face Documentation", url: "https://huggingface.co/docs", tags: ["Free", "Official"] },
    },
  },
  {
    id: "computer-vision",
    label: "Computer Vision",
    description: "Image classification, object detection (YOLO), image segmentation, and OpenCV. Computer vision is used in self-driving cars, medical imaging, and security cameras.",
    status: "important",
    resources: {
      youtube: { title: "Computer Vision Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=01sAkU_NvOY", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "Convolutional Neural Networks – deeplearning.ai", url: "https://www.coursera.org/learn/convolutional-neural-networks", provider: "Coursera", tags: ["Free Audit"], duration: "4 weeks" },
      docs: { title: "OpenCV Documentation", url: "https://docs.opencv.org/4.x/", tags: ["Free", "Official"] },
    },
  },
  {
    id: "mlops",
    label: "MLOps",
    description: "Deploying, monitoring, and maintaining ML models in production. MLflow for experiment tracking, Docker for containerization, and cloud ML platforms (SageMaker, Vertex AI).",
    status: "optional",
    resources: {
      youtube: { title: "MLOps Crash Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=-dJPoLm_gtE", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "4h" },
      course: { title: "Machine Learning Engineering for Production (MLOps)", url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops", provider: "Coursera / deeplearning.ai", tags: ["Free Audit"], duration: "4 months" },
      docs: { title: "MLflow Documentation", url: "https://mlflow.org/docs/latest/index.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "generative-ai",
    label: "Generative AI",
    description: "Prompt engineering, RAG (Retrieval Augmented Generation), building AI agents, LangChain, vector databases, and image generation (Stable Diffusion). The bleeding edge of AI in 2024.",
    status: "optional",
    resources: {
      youtube: { title: "LangChain & Vector DBs – freeCodeCamp", url: "https://www.youtube.com/watch?v=HSZ_uaif57o", provider: "freeCodeCamp", tags: ["Free", "Recommended"], duration: "5h" },
      course: { title: "Generative AI with LLMs – AWS / deeplearning.ai", url: "https://www.coursera.org/learn/generative-ai-with-llms", provider: "Coursera", tags: ["Free Audit", "Recommended"], duration: "3 weeks" },
      docs: { title: "LangChain Documentation", url: "https://python.langchain.com/docs/get_started/introduction", tags: ["Free", "Official"] },
    },
  },
];
