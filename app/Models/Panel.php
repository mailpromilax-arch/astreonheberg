<?php
declare(strict_types=1);
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Panel extends Model {
 protected $fillable=['name','url','api_key','client_api_key','is_active'];
 protected $casts=['api_key'=>'encrypted','client_api_key'=>'encrypted','is_active'=>'boolean'];
 public function locations(): HasMany { return $this->hasMany(Location::class); }
 public function nodes(): HasMany { return $this->hasMany(Node::class); }
 public function servers(): HasMany { return $this->hasMany(Server::class); }
}
