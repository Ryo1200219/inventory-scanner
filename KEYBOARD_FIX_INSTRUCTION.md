# キーボード自動閉鎖の実装指示 (v1.1.4)

## 実装内容
商品名入力フィールド（input-name）で Enter が押された際、'blur()' を実行してキーボードを閉じる。

```javascript
inputName.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        this.blur();
    }
});
```