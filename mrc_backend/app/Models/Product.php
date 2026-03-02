<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'brand_id',
        'category_id',
        'name',
        'slug',
        'short_description',
        'long_description',
        'min_price',
        'max_price',
        'status',
        'seo_title',
        'seo_description',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    // SCOPES for fast filtering
    public function scopeActive($query)
    {
        return $query->where('status', 'published');
    }
}
