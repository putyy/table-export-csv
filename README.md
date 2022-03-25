## laravel-admin js导出csv扩展

### 安装

```shell
composer require putyy/table-export-csv

php artisan vendor:publish --provider="Pt\WebExportCsv\WebExportCsvServiceProvider"
```

### 使用如下

```php
...
$grid->tools(function ($tools) {
    // 1导出当前页 2导出全部
    $tools->append(new \Pt\WebExportCsv\WebExportCsvTool(1));
    $func = <<<HTML
        <script type="application/javascript">
            function currentPageColumnHandle(td){
                return "666";
            }
        </script>
    HTML;
    $tools->append(new \Pt\WebExportCsv\WebExportCsvTool(2, $func));
});
...
```

q!
