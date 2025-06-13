// JSON Validator TypeScript Project
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  formatted?: string;
  size: number;
  depth: number;
}

interface JsonAnalysis {
  keys: string[];
  types: Record<string, string>;
  arrayLengths: Record<string, number>;
  depth: number;
  size: number;
}

class JsonValidator {
  /**
   * JSONの妥当性を検証
   */
  validate(jsonString: string): ValidationResult {
    const errors: string[] = [];
    let parsed: any = null;
    let isValid = true;

    // 基本的なJSON構文チェック
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      isValid = false;
      if (error instanceof Error) {
        errors.push(`JSON構文エラー: ${error.message}`);
      } else {
        errors.push("JSON構文エラー: 不明なエラー");
      }
      return {
        isValid,
        errors,
        size: jsonString.length,
        depth: 0,
      };
    }

    // 構造的な問題をチェック
    const structuralErrors = this.checkStructuralIssues(parsed);
    errors.push(...structuralErrors);

    // フォーマット済みJSONを生成
    const formatted = JSON.stringify(parsed, null, 2);

    return {
      isValid: errors.length === 0,
      errors,
      formatted,
      size: jsonString.length,
      depth: this.calculateDepth(parsed),
    };
  }

  /**
   * JSONを整形
   */
  format(jsonString: string, indent: number = 2): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, indent);
    } catch (error) {
      throw new Error(
        `フォーマットできません: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * JSONを最小化（圧縮）
   */
  minify(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed);
    } catch (error) {
      throw new Error(
        `最小化できません: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * JSONの詳細分析
   */
  analyze(jsonString: string): JsonAnalysis {
    try {
      const parsed = JSON.parse(jsonString);
      return this.analyzeObject(parsed);
    } catch (error) {
      throw new Error(
        `分析できません: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * JSONスキーマの生成
   */
  generateSchema(jsonString: string): any {
    try {
      const parsed = JSON.parse(jsonString);
      return this.generateSchemaFromValue(parsed);
    } catch (error) {
      throw new Error(
        `スキーマ生成できません: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * JSONパスで値を検索
   */
  findByPath(jsonString: string, path: string): any {
    try {
      const parsed = JSON.parse(jsonString);
      return this.getValueByPath(parsed, path.split("."));
    } catch (error) {
      throw new Error(
        `パス検索できません: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private checkStructuralIssues(obj: any, path: string = "root"): string[] {
    const errors: string[] = [];

    if (obj === null || obj === undefined) {
      return errors;
    }

    if (Array.isArray(obj)) {
      // 配列の要素数チェック
      if (obj.length > 10000) {
        errors.push(`${path}: 配列のサイズが大きすぎます (${obj.length}要素)`);
      }

      // 配列要素の再帰チェック
      obj.forEach((item, index) => {
        errors.push(...this.checkStructuralIssues(item, `${path}[${index}]`));
      });
    } else if (typeof obj === "object") {
      const keys = Object.keys(obj);

      // オブジェクトのキー数チェック
      if (keys.length > 1000) {
        errors.push(
          `${path}: オブジェクトのキー数が多すぎます (${keys.length}キー)`
        );
      }

      // キー名の妥当性チェック
      keys.forEach((key) => {
        if (key.length > 100) {
          errors.push(`${path}.${key}: キー名が長すぎます`);
        }
        if (key.trim() !== key) {
          errors.push(`${path}.${key}: キー名に余分な空白があります`);
        }
      });

      // 値の再帰チェック
      keys.forEach((key) => {
        errors.push(...this.checkStructuralIssues(obj[key], `${path}.${key}`));
      });
    } else if (typeof obj === "string") {
      // 文字列の長さチェック
      if (obj.length > 100000) {
        errors.push(`${path}: 文字列が長すぎます (${obj.length}文字)`);
      }
    }

    return errors;
  }

  private calculateDepth(obj: any, currentDepth: number = 0): number {
    if (obj === null || typeof obj !== "object") {
      return currentDepth;
    }

    let maxDepth = currentDepth;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const depth = this.calculateDepth(item, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    } else {
      for (const key in obj) {
        const depth = this.calculateDepth(obj[key], currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }

    return maxDepth;
  }

  private analyzeObject(obj: any, path: string = ""): JsonAnalysis {
    const analysis: JsonAnalysis = {
      keys: [],
      types: {},
      arrayLengths: {},
      depth: this.calculateDepth(obj),
      size: JSON.stringify(obj).length,
    };

    this.collectAnalysisData(obj, analysis, path);
    return analysis;
  }

  private collectAnalysisData(
    obj: any,
    analysis: JsonAnalysis,
    path: string
  ): void {
    if (obj === null) {
      analysis.types[path || "root"] = "null";
    } else if (Array.isArray(obj)) {
      analysis.types[path || "root"] = "array";
      analysis.arrayLengths[path || "root"] = obj.length;

      obj.forEach((item, index) => {
        this.collectAnalysisData(
          item,
          analysis,
          path ? `${path}[${index}]` : `[${index}]`
        );
      });
    } else if (typeof obj === "object") {
      analysis.types[path || "root"] = "object";
      const keys = Object.keys(obj);
      analysis.keys.push(...keys.map((key) => (path ? `${path}.${key}` : key)));

      keys.forEach((key) => {
        this.collectAnalysisData(
          obj[key],
          analysis,
          path ? `${path}.${key}` : key
        );
      });
    } else {
      analysis.types[path || "root"] = typeof obj;
    }
  }

  private generateSchemaFromValue(value: any): any {
    if (value === null) {
      return { type: "null" };
    }

    if (Array.isArray(value)) {
      return {
        type: "array",
        items:
          value.length > 0
            ? this.generateSchemaFromValue(value[0])
            : { type: "any" },
      };
    }

    if (typeof value === "object") {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      Object.keys(value).forEach((key) => {
        properties[key] = this.generateSchemaFromValue(value[key]);
        required.push(key);
      });

      return {
        type: "object",
        properties,
        required,
      };
    }

    return { type: typeof value };
  }

  private getValueByPath(obj: any, pathArray: string[]): any {
    let current = obj;

    for (const key of pathArray) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // 配列インデックスの処理
      if (key.match(/^\[\d+\]$/)) {
        const index = parseInt(key.slice(1, -1));
        if (Array.isArray(current) && index < current.length) {
          current = current[index];
        } else {
          return undefined;
        }
      } else {
        if (typeof current === "object" && key in current) {
          current = current[key];
        } else {
          return undefined;
        }
      }
    }

    return current;
  }
}

// デモンストレーション
function demonstrateJsonValidator(): void {
  const validator = new JsonValidator();

  console.log("=== JSON バリデーター デモ ===\n");

  // テストJSONデータ
  const validJson = `{
    "name": "太郎",
    "age": 30,
    "hobbies": ["読書", "映画鑑賞", "プログラミング"],
    "address": {
      "prefecture": "東京都",
      "city": "渋谷区"
    },
    "active": true
  }`;

  const invalidJson = `{
    "name": "太郎",
    "age": 30,
    "hobbies": ["読書", "映画鑑賞",],
    "address": {
      "prefecture": "東京都"
      "city": "渋谷区"
    }
  }`;

  // 有効なJSONのテスト
  console.log("✅ 有効なJSONのテスト:");
  const validResult = validator.validate(validJson);
  console.log(`妥当性: ${validResult.isValid ? "✅ 有効" : "❌ 無効"}`);
  console.log(`サイズ: ${validResult.size} 文字`);
  console.log(`深度: ${validResult.depth}`);

  if (validResult.errors.length > 0) {
    console.log("エラー:", validResult.errors);
  }

  // 無効なJSONのテスト
  console.log("\n❌ 無効なJSONのテスト:");
  const invalidResult = validator.validate(invalidJson);
  console.log(`妥当性: ${invalidResult.isValid ? "✅ 有効" : "❌ 無効"}`);
  if (invalidResult.errors.length > 0) {
    console.log("エラー:", invalidResult.errors);
  }

  // JSON分析
  console.log("\n📊 JSON分析:");
  try {
    const analysis = validator.analyze(validJson);
    console.log(`キー数: ${analysis.keys.length}`);
    console.log(`深度: ${analysis.depth}`);
    console.log(`サイズ: ${analysis.size} 文字`);
    console.log("データ型:", Object.entries(analysis.types));
  } catch (error) {
    console.log("分析エラー:", error);
  }

  // パス検索
  console.log("\n🔍 パス検索例:");
  try {
    const name = validator.findByPath(validJson, "name");
    const city = validator.findByPath(validJson, "address.city");
    const hobby = validator.findByPath(validJson, "hobbies[0]");

    console.log(`name: ${name}`);
    console.log(`address.city: ${city}`);
    console.log(`hobbies[0]: ${hobby}`);
  } catch (error) {
    console.log("パス検索エラー:", error);
  }
}

// コマンドライン引数処理
function handleCommandLineArgs(): void {
  const args = process.argv.slice(2);
  const validator = new JsonValidator();

  if (args.length === 0) {
    demonstrateJsonValidator();
    return;
  }

  const command = args[0].toLowerCase();

  switch (command) {
    case "validate":
      if (args.length < 2) {
        console.log('使用法: npm run dev validate "JSON文字列"');
        return;
      }
      const result = validator.validate(args[1]);
      console.log(`妥当性: ${result.isValid ? "✅ 有効" : "❌ 無効"}`);
      if (result.errors.length > 0) {
        console.log("エラー:", result.errors.join(", "));
      }
      break;

    case "format":
      if (args.length < 2) {
        console.log('使用法: npm run dev format "JSON文字列" [インデント]');
        return;
      }
      try {
        const indent = args[2] ? parseInt(args[2]) : 2;
        const formatted = validator.format(args[1], indent);
        console.log(formatted);
      } catch (error) {
        console.log("フォーマットエラー:", error);
      }
      break;

    case "minify":
      if (args.length < 2) {
        console.log('使用法: npm run dev minify "JSONフリー列"');
        return;
      }
      try {
        const minified = validator.minify(args[1]);
        console.log(minified);
      } catch (error) {
        console.log("最小化エラー:", error);
      }
      break;

    case "analyze":
      if (args.length < 2) {
        console.log('使用法: npm run dev analyze "JSONフリー列"');
        return;
      }
      try {
        const analysis = validator.analyze(args[1]);
        console.log("分析結果:", JSON.stringify(analysis, null, 2));
      } catch (error) {
        console.log("分析エラー:", error);
      }
      break;

    default:
      console.log("使用可能なコマンド: validate, format, minify, analyze");
  }
}

// メイン実行
if (require.main === module) {
  handleCommandLineArgs();
}

export { JsonValidator, type ValidationResult, type JsonAnalysis };